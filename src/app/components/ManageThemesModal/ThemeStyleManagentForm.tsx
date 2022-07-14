import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { themesListSelector, tokensSelector } from '@/selectors';

type Props = {};

export const ThemeStyleManagementForm = () => {
  const themes = useSelector(themesListSelector);
  const tokenSets = useSelector(tokensSelector);

  // @TODO resolve names
  const stylesInfo = useMemo(() => {

  }, []);
};
