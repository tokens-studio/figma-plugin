import type { Action } from 'redux';
import { AnyInspectStateAction } from './AnyInspectStateAction';
import { AnySettingsStateAction } from './AnySettingsStateAction';
import { AnyTokenStateAction } from './AnyTokenStateAction';
import { AnyUiStateAction } from './AnyUiStateAction';

export type AnyAction<GlobalScope = false> =
Action<'RESET_APP'>
| AnyInspectStateAction<GlobalScope>
| AnySettingsStateAction<GlobalScope>
| AnyTokenStateAction<GlobalScope>
| AnyUiStateAction<GlobalScope>;
