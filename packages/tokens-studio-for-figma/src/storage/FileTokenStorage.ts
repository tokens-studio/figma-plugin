import compact from 'just-compact';
import JSZip from 'jszip';
import {
  RemoteTokenStorage, RemoteTokenstorageErrorMessage, RemoteTokenStorageFile, RemoteTokenStorageMetadata, RemoteTokenStorageSingleTokenSetFile, RemoteTokenStorageThemesFile,
} from './RemoteTokenStorage';
import IsJSONString from '@/utils/isJSONString';
import { complexSingleFileSchema, multiFileSchema } from './schemas';
import { ErrorMessages } from '@/constants/ErrorMessages';
import { SystemFilenames } from '@/constants/SystemFilenames';

type StorageFlags = {
  multiFileEnabled: boolean
};

export type SaveOption = {
  storeTokenIdInJsonEditor: boolean
};
export class FileTokenStorage extends RemoteTokenStorage<unknown, SaveOption> {
  private files: FileList;

  protected flags: StorageFlags = {
    multiFileEnabled: false,
  };

  constructor(files: FileList) {
    super();
    this.files = files;
  }

  public enableMultiFile() {
    this.flags.multiFileEnabled = true;
    return this;
  }

  private async readZipFile(zipFile: File): Promise<RemoteTokenStorageFile[] | RemoteTokenstorageErrorMessage> {
    try {
      const zip = new JSZip();
      const content = await zip.loadAsync(zipFile);
      const jsonFiles: { name: string; content: string }[] = [];

      // Extract all JSON files from the ZIP
      const filePromises = Object.keys(content.files).map(async (fileName) => {
        const file = content.files[fileName];
        if (!file.dir && fileName.endsWith('.json')) {
          const fileContent = await file.async('text');
          return { name: fileName, content: fileContent };
        }
        return null;
      });

      const extractedFiles = await Promise.all(filePromises);
      jsonFiles.push(...extractedFiles.filter((f): f is { name: string; content: string } => f !== null));

      // Sort files for consistent processing
      jsonFiles.sort((a, b) => a.name.localeCompare(b.name));

      // Process extracted files
      const parsedFiles: RemoteTokenStorageFile[] = [];

      for (const jsonFile of jsonFiles) {
        if (jsonFile.content && IsJSONString(jsonFile.content)) {
          const parsedJsonData = JSON.parse(jsonFile.content);
          const validationResult = await multiFileSchema.safeParseAsync(parsedJsonData);

          if (validationResult.success) {
            const name = jsonFile.name.replace('.json', '');
            const baseName = name.includes('/') ? name.substring(name.lastIndexOf('/') + 1) : name;

            if (baseName === SystemFilenames.THEMES && Array.isArray(validationResult.data)) {
              parsedFiles.push({
                path: jsonFile.name,
                type: 'themes',
                data: validationResult.data,
              } as RemoteTokenStorageThemesFile);
            } else if (baseName === SystemFilenames.METADATA) {
              parsedFiles.push({
                path: jsonFile.name,
                type: 'metadata',
                data: validationResult.data as RemoteTokenStorageMetadata,
              });
            } else if (!Array.isArray(validationResult.data)) {
              parsedFiles.push({
                path: jsonFile.name,
                name: baseName,
                type: 'tokenSet',
                data: validationResult.data,
              } as RemoteTokenStorageSingleTokenSetFile);
            }
          }
        }
      }

      return parsedFiles;
    } catch (e) {
      console.log('Error reading ZIP file:', e);
      return {
        errorMessage: ErrorMessages.FILE_CREDENTIAL_ERROR,
      };
    }
  }

  public async read(): Promise<RemoteTokenStorageFile[] | RemoteTokenstorageErrorMessage> {
    try {
      // Check if the file is a ZIP file
      if (this.files.length === 1 && this.files[0].name.endsWith('.zip')) {
        return this.readZipFile(this.files[0]);
      }

      if (this.flags.multiFileEnabled && this.files.length > 1) {
        const jsonFiles = Array.from(this.files).filter((file) => file.webkitRelativePath.endsWith('.json'))
          .sort((a, b) => (
            (a.webkitRelativePath && b.webkitRelativePath) ? a.webkitRelativePath.localeCompare(b.webkitRelativePath) : 0
          ));
        // Return a promise per file
        const filePromises = jsonFiles.map((file) => new Promise((resolve) => {
          const reader = new FileReader();
          reader.readAsText(file);
          reader.onload = async () => {
            const fileContent = reader.result as string;
            if (fileContent && IsJSONString(fileContent)) {
              const parsedJsonData = JSON.parse(fileContent);
              const validationResult = await multiFileSchema.safeParseAsync(parsedJsonData);
              if (validationResult.success) {
                resolve(validationResult.data);
              }
            }
            resolve(null);
          };
        }));
        // Wait for all promises to be resolved
        const jsonFileContents = await Promise.all(filePromises);
        return compact(jsonFileContents.map<RemoteTokenStorageFile | null>((fileContent, index) => {
          const { webkitRelativePath } = jsonFiles[index];
          if (fileContent) {
            const name = webkitRelativePath?.substring(webkitRelativePath.indexOf('/') + 1)?.replace('.json', '');
            if (name === SystemFilenames.THEMES && Array.isArray(fileContent)) {
              return {
                path: webkitRelativePath,
                type: 'themes',
                data: fileContent,
              } as RemoteTokenStorageThemesFile;
            }

            if (name === SystemFilenames.METADATA) {
              return {
                path: webkitRelativePath,
                type: 'metadata',
                data: fileContent as RemoteTokenStorageMetadata,
              };
            }

            if (!Array.isArray(fileContent)) {
              return {
                path: webkitRelativePath,
                name,
                type: 'tokenSet',
                data: fileContent,
              } as RemoteTokenStorageSingleTokenSetFile;
            }
          }
          return null;
        }));
      }
      if (this.files[0].name.endsWith('.json')) {
        const reader = new FileReader();
        reader.readAsText(this.files[0]);
        return await new Promise<RemoteTokenStorageFile[] | RemoteTokenstorageErrorMessage>((resolve) => {
          reader.onload = async () => {
            const result = reader.result as string;

            if (result && IsJSONString(result)) {
              const parsedJsonData = JSON.parse(result);
              const validationResult = await complexSingleFileSchema.safeParseAsync(parsedJsonData);
              if (validationResult.success) {
                const { $themes = [], $metadata, ...data } = validationResult.data;
                resolve([
                  {
                    type: 'themes',
                    path: this.files[0].name,
                    data: Array.isArray($themes) ? $themes : [],
                  },
                  ...($metadata ? [
                    {
                      type: 'metadata' as const,
                      path: this.files[0].name,
                      data: $metadata,
                    },
                  ] : []),
                  ...Object.entries(data).map<RemoteTokenStorageFile>(([name, tokenSet]) => ({
                    name,
                    type: 'tokenSet',
                    path: this.files[0].name,
                    data: !Array.isArray(tokenSet) ? tokenSet : {},
                  })),
                ]);
              }
              resolve({
                errorMessage: ErrorMessages.VALIDATION_ERROR,
              });
            }
            resolve([]);
          };
        });
      }
    } catch (e) {
      console.log(e);
    }
    return [];
  }

  public async write(): Promise<boolean> {
    throw new Error('Not implemented');
  }
}
