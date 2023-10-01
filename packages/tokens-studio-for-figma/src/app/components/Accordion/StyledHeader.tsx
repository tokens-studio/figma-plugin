import { styled } from '@/stitches.config';
import { Flex } from '../Flex';

export const StyledHeader = styled(Flex, {
  gridRow: '1',
  gridColumn: '2',
  justifyContent: 'space-between',
  alignItems: 'center',
});
