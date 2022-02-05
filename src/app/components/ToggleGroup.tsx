import React from 'react';
import * as ToolbarPrimitive from '@radix-ui/react-toolbar';
import { styled } from '@/stitches.config';

const itemStyles = {
  all: 'unset',
  flex: '0 0 auto',
  color: 'black',
  height: 25,
  padding: '0 5px',
  borderRadius: 4,
  display: 'inline-flex',
  fontSize: 13,
  lineHeight: 1,
  alignItems: 'center',
  justifyContent: 'center',
  '&:hover': { backgroundColor: 'black', color: 'white' },
  '&:focus': { position: 'relative', boxShadow: '0 0 0 2px black' },
};

const StyledToggleGroup = styled(ToolbarPrimitive.ToggleGroup, {
  display: 'inline-flex',
  borderRadius: 4,
});

const StyledToggleItem = styled(ToolbarPrimitive.ToggleItem, {
  ...itemStyles,
  boxShadow: 0,
  backgroundColor: 'white',
  marginLeft: 2,
  '&:first-child': { marginLeft: 0 },
  '&[data-state=on]': { backgroundColor: '$interaction', color: '$onInteraction' },
});

function ToggleGroup() {
  return (
    <StyledToggleGroup type="multiple" aria-label="Text formatting">
      <StyledToggleItem value="textStyles" aria-label="Bold">
        Text styles
      </StyledToggleItem>
      <StyledToggleItem value="colorStyles" aria-label="Italic">
        Color styles
      </StyledToggleItem>
      <StyledToggleItem value="effectStyles" aria-label="Strike through">
        Shadow styles
      </StyledToggleItem>
    </StyledToggleGroup>
  );
}

export default ToggleGroup;
