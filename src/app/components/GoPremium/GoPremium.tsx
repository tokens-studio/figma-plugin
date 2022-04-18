import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import Box from '../Box';
import Button from '../Button';
import { userIdSelector } from '@/selectors/userIdSelector';
import getCheckoutUrl from './getCheckoutUrl';

export default function GoPremium() {
  const userId = useSelector(userIdSelector);

  const goToCheckout = useCallback(async () => {
    if (userId) {
      const checkoutUrl = await getCheckoutUrl(userId);
      window.open(checkoutUrl);
    }
  }, [userId]);

  return (
    <Box>
      <Button variant="secondary" onClick={goToCheckout}>
        Go premium
      </Button>
    </Box>
  );
}
