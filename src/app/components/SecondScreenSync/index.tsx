import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RealtimeChannel } from '@supabase/realtime-js';
import { themesListSelector, tokensSelector, usedTokenSetSelector } from '@/selectors';
import { useAuth } from '@/context/AuthContext';
import { secondScreenSelector } from '@/selectors/secondScreenSelector';
import supabase from '@/supabase';
import { Dispatch } from '@/app/store';

export default function SecondScreenSync() {
  const secondScreenOn = useSelector(secondScreenSelector);
  const dispatch = useDispatch<Dispatch>();
  const tokens = useSelector(tokensSelector);
  const themes = useSelector(themesListSelector);
  const usedTokenSets = useSelector(usedTokenSetSelector);
  const { user } = useAuth();

  useEffect(() => {
    let dbUpdateChannel: RealtimeChannel | null = null;
    // Supabase client setup
    if (user && secondScreenOn) {
      dbUpdateChannel = supabase
        .channel('value-db-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tokens',
            filter: `owner_email=eq.${user.email}`,
          },
          (payload: any) => {
            if (payload.new.ftData) {
              const { sets, themes: newThemes, usedTokenSets: newUsedTokenSets } = payload.new.ftData;

              if (sets && JSON.stringify(sets) !== JSON.stringify(tokens)) {
                dispatch.tokenState.setTokens(sets);
              }

              if (newUsedTokenSets && JSON.stringify(newUsedTokenSets) !== JSON.stringify(usedTokenSets)) {
                dispatch.tokenState.setUsedTokenSet(newUsedTokenSets);
              }
              if (newThemes && JSON.stringify(newThemes) !== JSON.stringify(themes)) {
                dispatch.tokenState.setThemes(newThemes);
              }
            }
          },
        )
        .subscribe((status: any, err: any) => {
          console.log(err);
        });
    }
    return () => {
      if (dbUpdateChannel) {
        if (dbUpdateChannel) supabase.realtime.removeChannel(dbUpdateChannel);
      }
    };
  }, [user, secondScreenOn, dispatch.tokenState, usedTokenSets, themes, tokens]);

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

  useEffect(() => {
    let channel: RealtimeChannel | null = null;

    if (user && secondScreenOn) {
      channel = supabase.channel(`${user.id}`, {
        config: {
          presence: {
            key: `plugin-${user.email}`,
          },
        },
      });
      channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && channel) {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });
    }

    return () => {
      if (channel) supabase.realtime.removeChannel(channel);
    };
  }, [user, secondScreenOn]);

  return null;
}
