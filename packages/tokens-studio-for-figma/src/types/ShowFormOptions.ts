import { EditTokenFormStatus } from '@/constants/EditTokenFormStatus';
import { SingleToken } from './tokens';

export type ShowFormOptions = {
  name: string;
  status?: EditTokenFormStatus;
  token: SingleToken | null;
};

export type ShowNewFormOptions = {
  name?: string;
};
