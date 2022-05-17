import React from 'react';

import IconEdit from '@/icons/edit.svg';
import IconAdd from '@/icons/add.svg';
import IconLoading from '@/icons/loading.svg';
import IconStyle from '@/icons/style.svg';
import IconHelp from '@/icons/help.svg';
import IconGithub from '@/icons/github.svg';
import IconHorizontalPadding from '@/icons/horizontalpadding.svg';
import IconVerticalPadding from '@/icons/verticalpadding.svg';
import IconGap from '@/icons/gap.svg';
import IconSpacing from '@/icons/spacing.svg';
import IconList from '@/icons/list.svg';
import IconGrid from '@/icons/grid.svg';
import IconBlend from '@/icons/blend.svg';
import IconBlendEmpty from '@/icons/blendEmpty.svg';
import IconImport from '@/icons/import.svg';
import IconFolder from '@/icons/folder.svg';
import IconRefresh from '@/icons/refresh.svg';
import IconTrash from '@/icons/trash.svg';
import IconBell from '@/icons/bell.svg';
import IconLibrary from '@/icons/library.svg';

const icons = {
  edit: IconEdit,
  add: IconAdd,
  loading: IconLoading,
  style: IconStyle,
  help: IconHelp,
  github: IconGithub,
  HorizontalPadding: IconHorizontalPadding,
  VerticalPadding: IconVerticalPadding,
  Gap: IconGap,
  Spacing: IconSpacing,
  list: IconList,
  grid: IconGrid,
  blend: IconBlend,
  blendempty: IconBlendEmpty,
  import: IconImport,
  folder: IconFolder,
  refresh: IconRefresh,
  trash: IconTrash,
  bell: IconBell,
  library: IconLibrary,
};

function Icon({ name }) {
  const IconName = icons[name];
  return <IconName />;
}

export default Icon;
