import { useSelector } from 'react-redux';
import { PropertyObject } from '@/types/properties';
import { RootState } from '@/app/store';
import { TokenTypes } from '@/constants/TokenTypes';
import { isPropertyType, isTokenType } from '@/utils/is';

// @README type should really be a Properties
export function useGetActiveState(properties: (PropertyObject | TokenTypes)[], type: string, name: string) {
  return useSelector((state: RootState) => {
    const { uiState } = state;
    if (
      !isPropertyType(type)
      && !isTokenType(type)
    ) {
      return false;
    }
    return (
      uiState.mainNodeSelectionValues[type] === name
      || properties.some((prop) => (
        // @TODO: This no longer seems to work for color tokens as prop is always string?
        typeof prop !== 'string'
        && uiState.mainNodeSelectionValues[prop.name] === name
      ))
    );
  });
}
