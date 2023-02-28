import { PostgrestClient } from '@supabase/postgrest-js';
import { StorageClient } from '@supabase/storage-js';
import {
  RealtimeChannel, RealtimeChannelOptions, RealtimeClient, RealtimeClientOptions,
} from '@supabase/realtime-js';
import { AuthData, AuthInfo } from './types/Auth';

const authUri = '/auth/v1';

class SupabaseClient {
  apiUrl: string;

  apikey: string;

  headers: { [key: string]: string };

  auth: any;

  postgrest: any;

  storage: any;

  realtime: any;

  realtimeUrl: string;

  refreshTokenInterval: any;

  intervalInSeconds = 5 * 60;

  /**
   * @param apiUrl  supabase api url.
   * @param apikey  supabase key.
   */
  constructor(apiUrl: string, apikey: string) {
    this.apiUrl = apiUrl;
    this.apikey = apikey;
    this.headers = this.getAuthHeaders(null);
    this.realtimeUrl = `${process.env.SUPABASE_URL}/realtime/v1`.replace(/^http/i, 'ws');
  }

  private getAuthHeaders(auth: AuthData | null): { [key: string]: string } {
    const headers: { [key: string]: string } = {};
    const authBearer = auth?.access_token ?? process.env.SUPABASE_ANON_KEY;
    headers.apikey = process.env.SUPABASE_ANON_KEY ?? '';
    headers.Authorization = `Bearer ${authBearer}`;
    headers['Content-Type'] = 'application/json';
    return headers;
  }

  private initRealtimeClient(options: RealtimeClientOptions) {
    return new RealtimeClient(this.realtimeUrl, {
      ...options,
      params: { ...{ apikey: this.apikey }, ...options?.params, headers: this.headers },
    });
  }

  private initPostgrest() {
    const REST_URL = `${process.env.SUPABASE_URL}/rest/v1`;
    const postgrest = new PostgrestClient(REST_URL, {
      schema: 'public',
      headers: this.headers,
    });
    return postgrest;
  }

  private initStorage() {
    const STORAGE_URL = `${process.env.SUPABASE_URL}/storage/v1`;
    const storageHeaders = { ...this.headers };
    delete storageHeaders['Content-Type'];
    const storage = new StorageClient(STORAGE_URL, storageHeaders);
    return storage;
  }

  private initializeAuth(auth: AuthData) {
    this.auth = auth;
    this.headers = this.getAuthHeaders(auth);
    this.postgrest = this.initPostgrest();
    this.storage = this.initStorage();
    this.realtime = this.initRealtimeClient({});
    this.realtime.setAuth(auth.access_token);

    // auto refresh token
    clearInterval(this.refreshTokenInterval);
    this.refreshTokenInterval = setInterval(async () => {
      const tokenState = this.checkToken(auth);
      if (tokenState === 'expired') {
        const { data, error } = await this.signIn({
          refresh_token: auth.refresh_token,
        });
        if (!error) {
          this.initializeAuth(data);
        }
      }
    }, this.intervalInSeconds * 1000);
  }

  private checkToken(auth: AuthData) {
    const now = new Date().getTime() / 1000;
    const diff = auth.expires_at - now;
    if (diff > 0) {
      // Almost expired
      if (diff < 20) {
        return 'near';
      }
      return 'safe';
    }
    // Expired
    return 'expired';
  }

  async verifyAuth(auth: AuthData, callback: (data: AuthData | null) => void) {
    const tokenState = this.checkToken(auth);
    if (tokenState === 'near') {
      // Refresh token automatically if token is almost expired
      const { data, error } = await this.signIn({
        refresh_token: auth.refresh_token,
      });

      if (error) {
        callback(null);
      } else {
        // Reset auth data
        this.initializeAuth(data);
        callback(data);
      }
    } else if (tokenState === 'expired') {
      callback(null);
    } else if (tokenState === 'safe') {
      // Initialize auth data
      this.initializeAuth(auth);
      callback(auth);
    }
  }

  async signUp(data: AuthInfo) {
    const auth = await fetch(`${this.apiUrl + authUri}/signup`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(data),
    }).then((res) => res.json());

    if (!auth.user) {
      return { data: null, error: auth };
    }
    const now = new Date().getTime() / 1000;
    const authData = { ...auth, expires_at: Math.floor(now + auth.expires_in) };

    // Logged in, initialize auth data
    this.initializeAuth(authData);
    return { data: authData, error: null };
  }

  async signIn(data: AuthInfo) {
    const url = `/token?grant_type=${data.email ? 'password' : 'refresh_token'}`;

    const auth = await fetch(this.apiUrl + authUri + url, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(data),
    }).then((res) => res.json());

    if (auth.error) {
      return { data: null, error: auth };
    }
    const now = new Date().getTime() / 1000;
    const authData = { ...auth, expires_at: Math.floor(now + auth.expires_in) };

    // Logged in, initialize auth data
    this.initializeAuth(authData);
    return { data: authData, error: null };
  }

  /**
   * Creates a Realtime channel with Broadcast, Presence, and Postgres Changes.
   *
   * @param {string} name - The name of the Realtime channel.
   * @param {Object} opts - The options to pass to the Realtime channel.
   *
   */
  channel(name: string, opts: RealtimeChannelOptions = { config: {} }): RealtimeChannel {
    return this.realtime.channel(name, opts);
  }
}

const supabase = new SupabaseClient(process.env.SUPABASE_URL ?? '', process.env.SUPABASE_ANON_KEY ?? '');

export default supabase;
