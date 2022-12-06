import { Properties } from '@/constants/Properties';

export type PropertyObject = {
  name: Properties;
  label?: string;
  icon?: 'Gap' | 'Spacing';
  clear?: Properties[];
  forcedValue?: string; // @TODO check typing
  disabled?: boolean;
  invisible?: boolean;
  childProperties?: PropertyObject[];
};
