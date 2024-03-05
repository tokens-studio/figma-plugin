import React from 'react';
import { Text as InternalText } from '@tokens-studio/ui';

function WrappedText(props) {
  const { size = 'xsmall' } = props;
  return <InternalText {...props} size={size} />;
}

export default WrappedText;
