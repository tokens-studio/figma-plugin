import React from 'react';
import Stack from '../Stack';
import Text from '../Text';
import { StitchesCSS } from '@/types';

type Props = React.HTMLAttributes<HTMLDivElement> & {
  css?: StitchesCSS
  title: string
  subtitle?: string
};

export const EmptyState: React.FC<Props> = ({ title, subtitle, ...props }) => (
  <Stack direction="column" justify="center" align="center" {...props}>
    <Text>{title}</Text>
    {(!!subtitle) && <Text muted>{subtitle}</Text>}
  </Stack>
);
