import * as React from 'react';

import IconEdit from './icons/IconEdit';
import IconAdd from './icons/IconAdd';
import IconLoading from './icons/IconLoading';
import IconStyle from './icons/IconStyle';
import IconHelp from './icons/IconHelp';
import IconGithub from './icons/IconGithub';

const icons = {
    edit: IconEdit,
    add: IconAdd,
    loading: IconLoading,
    style: IconStyle,
    help: IconHelp,
    github: IconGithub,
};

const Icon = ({name}) => {
    const IconName = icons[name];
    return <IconName />;
};

export default Icon;
