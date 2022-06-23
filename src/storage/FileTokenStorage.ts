import compact from 'just-compact';
import {
  RemoteTokenStorage, RemoteTokenStorageFile, RemoteTokenStorageSingleTokenSetFile, RemoteTokenStorageThemesFile,
} from './RemoteTokenStorage';
import IsJSONString from '@/utils/isJSONString';
import { complexSingleFileSchema, multiFileSchema } from './schemas';

type StorageFlags = {
  multiFileEnabled: boolean
};

export class FileTokenStorage extends RemoteTokenStorage {
  private files: FileList;

  private fileReader: FileReader;

  protected flags: StorageFlags = {
    multiFileEnabled: false,
  };

  constructor(files: FileList) {
    super();
    this.files = files;
    this.fileReader = new FileReader();
  }

  public enableMultiFile() {
    this.flags.multiFileEnabled = true;
    return this;
  }

  public async read(): Promise<RemoteTokenStorageFile[]> {
    try {
      if (this.flags.multiFileEnabled && this.files.length > 1) {
        const jsonFiles = Array.from(this.files);
        const filePromises = jsonFiles.map((file) =>
          // Return a promise per file
          new Promise((resolve) => {
            this.fileReader = new FileReader();
            this.fileReader.readAsText(file);
            this.fileReader.onload = async () => {
              const fileContent = this.fileReader.result as string;
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
            const name = webkitRelativePath?.split(/[\\/]/).pop()?.replace(/\.json$/, '');

            if (name === '$themes' && Array.isArray(fileContent)) {
              return {
                path: webkitRelativePath,
                type: 'themes',
                data: fileContent,
              } as RemoteTokenStorageThemesFile;
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

      this.fileReader.readAsText(this.files[0]);
      return await new Promise<RemoteTokenStorageFile[]>((resolve) => {
        this.fileReader.onload = async () => {
          const result = this.fileReader.result as string;

          if (result && IsJSONString(result)) {
            const parsedJsonData = JSON.parse(result);
            const validationResult = await complexSingleFileSchema.safeParseAsync(parsedJsonData);

            if (validationResult.success) {
              const { $themes = [], ...data } = validationResult.data;
              resolve([
                {
                  type: 'themes',
                  path: this.files[0].webkitRelativePath,
                  data: Array.isArray($themes) ? $themes : [],
                },
                ...Object.entries(data).map<RemoteTokenStorageFile>(([name, tokenSet]) => ({
                  name,
                  type: 'tokenSet',
                  path: this.files[0].webkitRelativePath,
                  data: !Array.isArray(tokenSet) ? tokenSet : {},
                })),
              ]);
            }
          }
          resolve([]);
        };
      });
    } catch (e) {
      console.log(e);
    }
    return [];
  }

  public async write(): Promise<boolean> {
    throw new Error('Not implemented');
  }
}
