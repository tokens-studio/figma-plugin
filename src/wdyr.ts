import React from 'react';
import * as ReactRedux from 'react-redux';
import whyDidYouRender from '@welldone-software/why-did-you-render';

whyDidYouRender(React, {
  trackAllPureComponents: true,
  trackHooks: true,
  trackExtraHooks: [
    [ReactRedux, 'useSelector'],
  ],
});
