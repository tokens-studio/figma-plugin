import { AnyTokenSet } from '@/types/tokens';
import { RemoteTokenStorage, RemoteTokenStorageFile } from './RemoteTokenStorage';
import IsJSONString from '@/utils/isJSONString';
import { singleFileSchema } from './schemas';
import { ThemeObjectsList } from '@/types';
import { tokensMapSchema } from './schemas/tokensMapSchema';

type FileData = {
  values: Record<string, AnyTokenSet<false>>
  $themes?: ThemeObjectsList
};

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

  private convertUrlDataToFiles(data: FileData): RemoteTokenStorageFile[] {
    return [
      {
        type: 'themes',
        path: '$themes.json',
        data: data.$themes ?? [],
      },
      ...Object.entries(data.values).map<RemoteTokenStorageFile>(([name, tokenSet]) => ({
        name,
        type: 'tokenSet',
        path: `${name}.json`,
        data: tokenSet,
      })),
    ];
  }

  public async read(): Promise<RemoteTokenStorageFile[]> {
    let data: RemoteTokenStorageFile[] = [];
    console.log("data", this.files)
    if (this.files.length === 1) {
      this.fileReader.readAsText(this.files[0]);
      this.fileReader.onload = async () => {
        console.log("ansyce")
        const result = this.fileReader.result as string;
        console.log("result", result)
        if (result && IsJSONString(result)) {
          const parsedJsonData = JSON.parse(result);
          console.log("parsed", parsedJsonData)
          const validationResult = await singleFileSchema.safeParseAsync(parsedJsonData);
          console.log("validata", validationResult)
          // @README if this validation passes we can assume it is in a newer format
          if (validationResult.success) {
            const urlstorageData = validationResult.data as FileData;
            data = this.convertUrlDataToFiles(urlstorageData);
          }

          // @README if not this is an older format where we just have tokens
          const onlyTokensValidationResult = await tokensMapSchema.safeParseAsync(parsedJsonData);
          if (onlyTokensValidationResult.success) {
            const urlstorageData = onlyTokensValidationResult.data as FileData['values'];
            data = this.convertUrlDataToFiles({ values: urlstorageData });
          }
        }
      };
      return data;
    }

    return [];
  }

  public async write(): Promise<boolean> {
    throw new Error('Not implemented');
  }
}
