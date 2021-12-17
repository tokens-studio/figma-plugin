import {SettingsState} from '@/app/store/models/settings';
import {StorageProviderType, StorageType} from './api';
import {PullStyleTypes, SelectionValue, TokenArrayGroup, TokenGroup} from './tokens';

export enum MessageFromPluginTypes {
    SELECTION = 'selection',
    NO_SELECTION = 'noselection',
    REMOTE_COMPONENTS = 'remotecomponents',
    TOKEN_VALUES = 'tokenvalues',
    STYLES = 'styles',
    RECEIVED_STORAGE_TYPE = 'receivedStorageType',
    API_CREDENTIALS = 'apiCredentials',
    API_PROVIDERS = 'apiProviders',
    USER_ID = 'userId',
    RECEIVED_LAST_OPENED = 'receivedLastOpened',
    UI_SETTINGS = 'uiSettings',
}

export enum MessageToPluginTypes {
    INITIATE = 'initiate',
    REMOVE_SINGLE_CREDENTIAL = 'remove-single-credential',
    GO_TO_NODE = 'gotonode',
    CREDENTIALS = 'credentials',
    UPDATE = 'update',
    CREATE_STYLES = 'create-styles',
    SET_NODE_DATA = 'set-node-data',
    REMOVE_NODE_DATA = 'remove-node-data',
    PULL_STYLES = 'pull-styles',
    SET_STORAGE_TYPE = 'set-storage-type',
    NOTIFY = 'notify',
    SET_UI = 'set_ui',
    RESIZE_WINDOW = 'resize_window',
    REMOVE_PLUGIN_DATA = 'remove_plugin_data',
    REMOVE_TOKENS_BY_VALUE = 'remove-tokens-by-value',
}

export type PostToFigmaProps =
    | {
          type: MessageToPluginTypes.INITIATE;
      }
    | {
          type: MessageToPluginTypes.REMOVE_SINGLE_CREDENTIAL;
          id: string;
          secret: string;
      }
    | {
          type: MessageToPluginTypes.GO_TO_NODE;
          id: string;
      }
    | {
          type: MessageToPluginTypes.CREDENTIALS;
          id: string;
          name: string;
          secret: string;
          provider: StorageProviderType;
      }
    | {
          type: MessageToPluginTypes.UPDATE;
          tokenValues: TokenGroup;
          tokens: TokenArrayGroup;
          updatedAt: string;
          settings: SettingsState;
      }
    | {
          type: MessageToPluginTypes.CREATE_STYLES;
          tokens: TokenArrayGroup;
          settings: SettingsState;
      }
    | {
          type: MessageToPluginTypes.SET_NODE_DATA;
          values: SelectionValue[];
          tokens: TokenArrayGroup;
          settings: SettingsState;
      }
    | {
          type: MessageToPluginTypes.REMOVE_NODE_DATA;
          key: string;
          nodes: string[];
      }
    | {
          type: MessageToPluginTypes.PULL_STYLES;
          styleTypes: PullStyleTypes;
      }
    | {
          type: MessageToPluginTypes.SET_STORAGE_TYPE;
          provider: StorageType;
      }
    | {
          type: MessageToPluginTypes.NOTIFY;
          msg: string;
          opts: {
              timeout?: number;
          };
      }
    | {
          type: MessageToPluginTypes.SET_UI;
          state: SettingsState;
      }
    | {
          type: MessageToPluginTypes.RESIZE_WINDOW;
          width: number;
          height: number;
      };
