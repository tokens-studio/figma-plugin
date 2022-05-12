import React from 'react';
import Box from './Box';
import Heading from './Heading';
import Text from './Text';

type BoxProps = React.ComponentProps<typeof Box>;
type Props = BoxProps & {
  css?: BoxProps['css']
  title: string
  text: string
};

export default function Blankslate({
  title, text, css = {}, ...props
}: Props) {
  return (
    <Box
      css={{
        ...css,
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        gap: '$2',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      {...props}
    >
      <Heading>{title}</Heading>
      <Text muted size="small">{text}</Text>
    </Box>
  );
}
