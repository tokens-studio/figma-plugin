import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { themesListSelector, tokensSelector } from '@/selectors';
import { useAuth } from '@/context/AuthContext';
import { secondScreenSelector } from '@/selectors/secondScreenSelector';
import supabase from '@/supabase';

export default function SecondScreenSync() {
  const secondScreenOn = useSelector(secondScreenSelector);
  const tokens = useSelector(tokensSelector);
  const themes = useSelector(themesListSelector);
  const { user } = useAuth();

  useEffect(() => {
    async function updateRemoteData(email: string, data: string) {
      await supabase.postgrest
        .from('tokens')
        .upsert({ data, owner_email: email }, { onConflict: 'owner_email', ignoreDuplicates: false })
        .eq('owner_email', email);
    }

    if (secondScreenOn && user) {
      const data = JSON.stringify({ sets: tokens, themes });
      updateRemoteData(user.email, data);
    }
  }, [tokens, themes, secondScreenOn, user]);

  return null;
}
