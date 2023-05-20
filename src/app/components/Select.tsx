import { ChevronDownIcon } from '@radix-ui/react-icons';
import React from 'react';
import { styled } from '@/stitches.config';

const StyledSelectWrapper = styled('div', {
  position: 'relative',
  display: 'inline-block',
});

const StyledSelect = styled('select', {
  all: 'unset',
  borderRadius: '$input',
  padding: '$3 $3 $3 24px',
  fontSize: 12,
  lineHeight: 1,
  backgroundColor: '$bgDefault',
  color: '$text',
  border: '1px solid $border',
  cursor: 'pointer',
  position: 'relative',
  '&:hover': { backgroundColor: '$bgSubtle' },
  '&:focus-visible': { boxShadow: '$focus' },
});

const StyledIcon = styled(ChevronDownIcon, {
  position: 'absolute',
  top: '50%',
  right: '$3',
  transform: 'translateY(-50%)',
  pointerEvents: 'none',
});

type Props = {
  id: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
};

export default function Select({
  id, value, onChange, children,
}: React.PropsWithChildren<Props>) {
  return (
    <StyledSelectWrapper>
      <StyledSelect value={value} name={id} data-cy={id} id={id} onChange={onChange}>
        {children}
      </StyledSelect>
      <StyledIcon />
    </StyledSelectWrapper>
  );
}
