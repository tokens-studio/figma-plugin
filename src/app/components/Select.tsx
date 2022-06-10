import React from 'react';
import { styled } from '@/stitches.config';
import type { StitchesCSS } from '@/types';

const StyledSelect = styled('select', {
  all: 'unset',
  borderRadius: '$input',
  padding: '$3',
  fontSize: 12,
  lineHeight: 1,
  color: '$text',
  border: '1px solid $border',
  '&:focus': { boxShadow: '$focus' },
});

type StyledSelectProps = React.ComponentProps<typeof StyledSelect>;
type Props = {
  id: string;
  css?: StitchesCSS;
  value?: StyledSelectProps['value'];
  onChange?: StyledSelectProps['onChange'];
};

export default function Select({
  css, value, id, onChange, children,
}: React.PropsWithChildren<Props>) {
  return (
    <StyledSelect css={css} value={value} name={id} data-cy={id} id={id} onChange={onChange}>
      {children}
    </StyledSelect>
  );
}
