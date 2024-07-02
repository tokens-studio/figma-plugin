import { numberRegex } from '../../constants/numberRegex';

export const numberMatchesPercentage = (value: string) => Boolean(value.trim().slice(-1) === '%' && value.trim().slice(0, -1).match(numberRegex));
