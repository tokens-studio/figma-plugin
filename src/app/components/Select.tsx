import React from 'react';
import { styled } from '@/stitches.config';
import type { StitchesCSS } from '@/types';

const StyledSelect = styled('select', {
  borderRadius: '$small',
  fontSize: '$xsmall',
  height: '$controlMedium',
  paddingLeft: '$2',
  lineHeight: 1,
  backgroundColor: '$bgDefault',
  color: '$fgDefault',
  border: '1px solid $borderDefault',
  cursor: 'pointer',
  '&:focus': { boxShadow: '$focus', outline: 'none' },
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
