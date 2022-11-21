import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { themesListSelector, tokensSelector, usedTokenSetSelector } from '@/selectors';
import { useAuth } from '@/context/AuthContext';
import { secondScreenSelector } from '@/selectors/secondScreenSelector';
import supabase from '@/supabase';

export default function SecondScreenSync() {
  const secondScreenOn = useSelector(secondScreenSelector);
  const tokens = useSelector(tokensSelector);
  const themes = useSelector(themesListSelector);
  const usedTokenSets = useSelector(usedTokenSetSelector);
  const { user } = useAuth();

  useEffect(() => {
    // Supabase client setup
    if (user && secondScreenOn) {
      supabase
        .channel('value-db-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tokens',
            filter: 'id=eq.46',
          },
          (payload: any) => {
            console.log(payload);
          },
        )
        .subscribe((status: any, err: any) => {
          console.log(err);
          console.log(status);
        });
    }
  }, [user, secondScreenOn]);

  useEffect(() => {
    async function updateRemoteData(email: string, ftData: string) {
      await supabase.postgrest
        .from('tokens')
        .upsert({ ftData, owner_email: email }, { onConflict: 'owner_email', ignoreDuplicates: false })
        .eq('owner_email', email);
    }

    if (secondScreenOn && user) {
      const data = JSON.stringify({ sets: tokens, themes, usedTokenSets });
      updateRemoteData(user.email, data);
    }
  }, [tokens, themes, secondScreenOn, user, usedTokenSets]);

  return null;
}
