import * as React from 'react';

import IconEdit from './icons/IconEdit';
import IconAdd from './icons/IconAdd';
import IconLoading from './icons/IconLoading';
import IconStyle from './icons/IconStyle';
import IconHelp from './icons/IconHelp';
import IconGithub from './icons/IconGithub';
import IconHorizontalPadding from './icons/IconHorizontalPadding';
import IconVerticalPadding from './icons/IconVerticalPadding';
import IconGap from './icons/IconGap';
import IconSpacing from './icons/IconSpacing';
import IconList from './icons/IconList';
import IconGrid from './icons/IconGrid';
import IconBlend from './icons/IconBlend';
import IconBlendEmpty from './icons/IconBlendEmpty';
import IconImport from './icons/IconImport';
import IconFolder from './icons/IconFolder';
import IconRefresh from './icons/IconRefresh';

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
};

const Icon = ({name}) => {
    const IconName = icons[name];
    return <IconName />;
};

export default Icon;
