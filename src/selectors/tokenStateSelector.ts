import { RootState } from '@/app/store';
import { TokenState } from '@/app/store/models/tokenState';

export const tokenStateSelector = (state: RootState):TokenState => state.tokenState;
