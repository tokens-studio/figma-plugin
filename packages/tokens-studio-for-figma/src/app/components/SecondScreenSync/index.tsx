import { useCallback, useEffect } from 'react';
import * as Sentry from '@sentry/react';
import { useDispatch, useSelector } from 'react-redux';
import { RealtimeChannel, RealtimePostgresUpdatePayload } from '@supabase/realtime-js';
import {
  activeThemeSelector, themesListSelector, tokensSelector, usedTokenSetSelector,
} from '@/selectors';
import { useAuth } from '@/context/AuthContext';
import { secondScreenSelector } from '@/selectors/secondScreenSelector';
import supabase from '@/supabase';
import { Dispatch } from '@/app/store';
import { Clients, TokenData } from '@/types/SecondScreen';

export default function SecondScreenSync() {
  const secondScreenOn = useSelector(secondScreenSelector);
  const dispatch = useDispatch<Dispatch>();
  const tokens = useSelector(tokensSelector);
  const activeTheme = useSelector(activeThemeSelector);
  const themes = useSelector(themesListSelector);
  const usedTokenSets = useSelector(usedTokenSetSelector);
  const { user } = useAuth();

  // Listen to data changes and update the state
  useEffect(() => {
    let dbUpdateChannel: RealtimeChannel | null = null;

    if (user && secondScreenOn) {
      dbUpdateChannel = supabase
        .channel('value-db-changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'tokens',
            filter: `owner_email=eq.${user.email}`,
          },
          (payload: RealtimePostgresUpdatePayload<TokenData>) => {
            if (payload.new.last_updated_by !== Clients.PLUGIN && payload.new.synced_data) {
              dispatch.tokenState.setNewTokenData(payload.new.synced_data);
            }
          },
        )
        .subscribe((status: any, err: any) => {
          if (err) {
            console.error(err);
            Sentry.captureException(err);
          }
        });
    }
    return () => {
      if (dbUpdateChannel) {
        if (dbUpdateChannel) supabase.realtime.removeChannel(dbUpdateChannel);
      }
    };
  }, [user, secondScreenOn, dispatch.tokenState]);

  // Listen to state changes and update the db
  useEffect(() => {
    async function updateRemoteData(email: string, data: string) {
      await supabase.postgrest
        .from('tokens')
        .upsert(
          { synced_data: data, owner_email: email, last_updated_by: Clients.PLUGIN },
          { onConflict: 'owner_email', ignoreDuplicates: false },
        )
        .eq('owner_email', email);
    }

    if (secondScreenOn && user) {
      const data = JSON.stringify({
        sets: tokens,
        themes,
        usedTokenSets,
        activeTheme,
      });

      updateRemoteData(user.email, data);
    }
  }, [tokens, themes, secondScreenOn, user, usedTokenSets, activeTheme]);

  // this is used for tracking if the plugin is on
  const createChannel = useCallback(() => {
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
          try {
            await channel.track({ online_at: new Date().toISOString() });
          } catch (error) {
            if (error) {
              console.log('channel error', error);
              Sentry.captureException(error);
            }
          }
        }
      });
    }

    return channel;
  }, [secondScreenOn, user]);

  useEffect(() => {
    const channel = createChannel();
    return () => {
      if (channel) supabase.realtime.removeChannel(channel);
    };
  }, [createChannel]);

  return null;
}
