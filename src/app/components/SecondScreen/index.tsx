import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { EnterFullScreenIcon } from '@radix-ui/react-icons';
import IconButton from '../IconButton';
import { tokenStateSelector } from '@/selectors';
import { supabase } from '@/supabase';
import { clientEmailSelector } from '@/selectors/getClientEmail';

export default function SecondScreen() {
  //   const { secondScreen } = useFlags();
  const tokenState = useSelector(tokenStateSelector);
  const email = useSelector(clientEmailSelector);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function getTokens() {
      if (email) {
        const { data } = await supabase.from('tokens').select('data').eq('owner_email', email);
        console.log('get tokenz', data);
      }
    }

    getTokens();
  }, [email]);

  const handleOpenSecondScreen = useCallback(async () => {
    setLoading(true);
    try {
      //   getDatabase();
      // const db = getDatabase(app);
    } catch (error) {
      console.log(error);
    }

    console.log({ themes: tokenState.themes, tokens: tokenState.tokens });
    setLoading(false);
  }, [tokenState]);

  return (
    <IconButton
      size="large"
      tooltip="Activate screen"
      dataCy="token-flow-button"
      loading={loading}
      onClick={handleOpenSecondScreen}
      icon={<EnterFullScreenIcon />}
    />
  );
}
