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

  public async read(): Promise<RemoteTokenStorageFile[]> {
    try {
      if (this.flags.multiFileEnabled && this.files.length > 1) {
        const jsonFiles = Array.from(this.files).filter((file) => file.webkitRelativePath.endsWith('.json'))
          .sort((a, b) => (
            (a.webkitRelativePath && b.webkitRelativePath) ? a.webkitRelativePath.localeCompare(b.webkitRelativePath) : 0
          ));
        const filePromises = jsonFiles.map((file) =>
          // Return a promise per file
          new Promise((resolve) => {
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
      if (this.files[0].name.endsWith('.json')) {
        const reader = new FileReader();
        reader.readAsText(this.files[0]);
        return await new Promise<RemoteTokenStorageFile[]>((resolve) => {
          reader.onload = async () => {
            const result = reader.result as string;

            if (result && IsJSONString(result)) {
              const parsedJsonData = JSON.parse(result);
              const validationResult = await complexSingleFileSchema.safeParseAsync(parsedJsonData);

              if (validationResult.success) {
                const { $themes = [], ...data } = validationResult.data;
                resolve([
                  {
                    type: 'themes',
                    path: this.files[0].name,
                    data: Array.isArray($themes) ? $themes : [],
                  },
                  ...Object.entries(data).map<RemoteTokenStorageFile>(([name, tokenSet]) => ({
                    name,
                    type: 'tokenSet',
                    path: this.files[0].name,
                    data: !Array.isArray(tokenSet) ? tokenSet : {},
                  })),
                ]);
              }
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
