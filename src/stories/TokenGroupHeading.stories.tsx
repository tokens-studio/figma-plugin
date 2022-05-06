import React from 'react';
import { Provider } from 'react-redux';
import TokenGroupHeading from '@/app/components/TokenGroupHeading';

import { ComponentStory, ComponentMeta } from '@storybook/react';

export default {
  title: 'TokenGroupHeading',
  component: TokenGroupHeading,
  argTypes: {
  },
  args:{
    path: '333.333'
  }
} as ComponentMeta<typeof TokenGroupHeading>;

const Template: ComponentStory<typeof TokenGroupHeading> = (args) => {
  return (
   <div>
     <Provider>
        <TokenGroupHeading id='333' path='333'>
        {/* {args} */}
        </TokenGroupHeading>
     </Provider>
   </div>
  )
};

export const Primary = Template.bind({});
Primary.args = {
  label: 'TokenGroup',
  path: '333',
}