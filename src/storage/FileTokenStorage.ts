import { compact } from 'lodash';
import {
  RemoteTokenStorage, RemoteTokenStorageFile, RemoteTokenStorageSingleTokenSetFile, RemoteTokenStorageThemesFile,
} from './RemoteTokenStorage';
import IsJSONString from '@/utils/isJSONString';
import { complexSingleFileSchema, multiFileSchema } from './schemas';
import { GitStorageMetadata } from './GitTokenStorage';

type StorageFlags = {
  multiFileEnabled: boolean
};

export class FileTokenStorage extends RemoteTokenStorage {
  private files: FileList;

  private fileReader: FileReader;

  private path: string;

  protected flags: StorageFlags = {
    multiFileEnabled: false,
  };

  constructor(files: FileList, path: string) {
    super();
    this.files = files;
    this.path = path;
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
        const jsonFileContents = await Promise.all(jsonFiles.map(async (file) => new Promise((resolve) => {
          this.fileReader.readAsText(file);
          this.fileReader.onload = async () => {
            const result = this.fileReader.result as string;
            console.log('resultmulti', result);
            if (result && IsJSONString(result)) {
              const parsedJsonData = JSON.parse(result);
              const validationResult = await multiFileSchema.safeParseAsync(parsedJsonData);
              console.log('multimval', validationResult);
              if (validationResult.success) {
                resolve(validationResult.data);
              }
            }
          };
        })));
        console.log('jsonFilecont', jsonFileContents);
        return compact(jsonFileContents.map<RemoteTokenStorageFile<GitStorageMetadata> | null>((fileContent, index) => {
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
      const data = await new Promise<RemoteTokenStorageFile[]>((resolve) => {
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
                  path: this.path,
                  data: Array.isArray($themes) ? $themes : [],
                },
                ...Object.entries(data).map<RemoteTokenStorageFile<GitStorageMetadata>>(([name, tokenSet]) => ({
                  name,
                  type: 'tokenSet',
                  path: this.path,
                  data: !Array.isArray(tokenSet) ? tokenSet : {},
                })),
              ]);
            }
          }
          resolve([]);
        };
      });
      return data;
    } catch (e) {
      console.log(e);
    }
    return [];
  }

  public async write(): Promise<boolean> {
    throw new Error('Not implemented');
  }
}
