// @ts-nocheck
import { createFigma } from 'figma-api-stub';
import mock from '../mocks/swapThemeMock.json';
import documentChildren from '../mocks/flat-file_children.json';
import { swapStyles } from '@/plugin/asyncMessageHandlers/swapStyles';
import { UpdateMode } from '@/constants/UpdateMode';

// There's a few typescript issues with the mock...

global.figma = createFigma({
  simulateErrors: true,
});

documentChildren.forEach((child) => { child.parent = figma.currentPage; });

global.figma._currentPage.children = documentChildren; // eslint-disable-line no-underscore-dangle

swapStyles(mock.activeTheme, mock.themes, UpdateMode.DOCUMENT);
