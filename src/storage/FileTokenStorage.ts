import { ThemeObjectsList } from '@/types';
import { AnyTokenSet } from '@/types/tokens';
import { RemoteTokenStorage, RemoteTokenStorageFile } from './RemoteTokenStorage';
import IsJSONString from '@/utils/isJSONString';

// type UrlData = {
//   values: Record<string, AnyTokenSet<false>>
//   $themes?: ThemeObjectsList
// };

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
    if (this.files.length === 1) {
      this.fileReader.readAsText(this.files[0]);
      this.fileReader.onload = () => {
        const result = this.fileReader.result as string;
        if (result && IsJSONString(result)) {
          const parsed = JSON.parse(result);
          return [
            {
              type: 'themes',
              path: `${this.path}/$themes.json`,
              data: parsed.$themes ?? [],
            },
            ...(Object.entries(parsed).filter(([key]) => key !== '$themes') as [string, AnyTokenSet<false>][]).map(([name, tokenSet]) => ({
              name,
              type: 'tokenSet',
              path: `${this.path}/${name}.json`,
              data: tokenSet,
            })),
          ];
        }
      };
    }

    return [];
  }

  public async write(): Promise<boolean> {
    throw new Error('Not implemented');
  }
}
