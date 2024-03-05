import { useDispatch } from 'react-redux';
import { useCallback, useMemo } from 'react';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { Dispatch } from '../app/store';

export default function useFigmaFonts() {
  const dispatch = useDispatch<Dispatch>();

  // Gets value of token
  const getFigmaFonts = useCallback(async () => {
    const figmaFonts = await AsyncMessageChannel.ReactInstance.message({
      type: AsyncMessageTypes.GET_FIGMA_FONTS,
    });
    dispatch.uiState.setFigmaFonts(figmaFonts.fonts);
  }, [dispatch.uiState]);

  return useMemo(() => ({
    getFigmaFonts,
  }), [
    getFigmaFonts,
  ]);
}
