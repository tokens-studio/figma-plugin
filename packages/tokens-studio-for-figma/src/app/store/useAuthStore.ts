import { create } from 'zustand';
import { OAuthService } from '../services/OAuthService';
import { OAuthError } from '@/types/OAuthError';
import type { OAuthTokens, UserData, Organization, Project } from '@/types/oauth';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { fetchProjectDataRest } from '@/utils/tokensStudio/fetchProjectDataRest';
import { store } from '@/app/store';
import { notifyToUI } from '@/plugin/notifiers';
import compact from 'just-compact';
import { TokenFormat } from '@/plugin/TokenFormatStoreClass';
import { TOKENS_STUDIO_APP_URL } from '@/constants/TokensStudio';

interface DeviceCodeState {
  userCode: string;
  verificationUri: string;
  expiresAt: number; // Unix timestamp
}

interface AuthState {
  isAuthenticated: boolean;
  oauthTokens: OAuthTokens | null;
  user: UserData | null;
  organizations: Organization[];
  activeOrganizationId: string | null;
  activeOrganization: Organization | null;
  activeProject: Project | null;
  error: string | null;
  isLoading: boolean;
  isPro: boolean;
  deviceCode: DeviceCodeState | null; // Device code info for UI display
  deviceCodeAbortController: AbortController | null;
  loginWithOAuth: () => Promise<void>;
  logout: () => Promise<void>;
  setError: (error: string | null) => void;
  setActiveOrganization: (orgId: string) => void;
  setActiveProject: (projectId: string) => void;
  setOAuthTokens: (tokens: OAuthTokens | null) => Promise<void>;
  fetchUserData: (tokens: OAuthTokens, persistedProjectId?: string) => Promise<void>;
  fetchProjects: (orgId: string, persistedProjectId?: string) => Promise<void>;
  loadProjectTokens: (projectId: string) => Promise<void>;
  refreshTokens: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  oauthTokens: null,
  user: null,
  organizations: [],
  activeOrganizationId: null,
  activeOrganization: null,
  activeProject: null,
  error: null,
  isLoading: false,
  isPro: false,
  deviceCode: null,
  deviceCodeAbortController: null,
  loginWithOAuth: async () => {
    set({ isLoading: true, error: null, deviceCode: null });

    try {
      const studioUrl = TOKENS_STUDIO_APP_URL;
      let tokens: OAuthTokens;

      if (OAuthService.usesDeviceCodeFlow(studioUrl)) {
        // Use Device Code Flow
        const deviceAuth = await OAuthService.requestDeviceAuthorization(
          studioUrl,
          'figma_plugin',
          'read write',
        );

        // Store device code info for UI display
        const expiresAt = Date.now() + deviceAuth.expires_in * 1000;
        set({
          deviceCode: {
            userCode: deviceAuth.user_code,
            verificationUri: deviceAuth.verification_uri,
            expiresAt,
          },
        });

        // Open verification URL in new window
        const urlToOpen = deviceAuth.verification_uri_complete || deviceAuth.verification_uri;
        if (urlToOpen) {
          window.open(urlToOpen, '_blank');
        }

        // Create abort controller for cancellation
        const abortController = new AbortController();
        set({ deviceCodeAbortController: abortController });

        // Poll for token (this will wait until user authorizes)
        tokens = await OAuthService.completeDeviceCodeFlow(
          studioUrl,
          deviceAuth.device_code,
          deviceAuth.interval,
          deviceAuth.expires_in,
          'figma_plugin',
          abortController.signal,
        );

        // Clear device code state and abort controller
        set({ deviceCode: null, deviceCodeAbortController: null });
      } else {
        // Fallback or old PKCE Flow
        const result = await OAuthService.performPKCEFlow(studioUrl);
        tokens = result.tokens;
      }

      // POLL FOR TOKEN ... (already handled above)

      await get().fetchUserData(tokens);
      await get().setOAuthTokens(tokens);

    } catch (error) {
      let errorMessage = 'OAuth login failed';
      if (error instanceof OAuthError) {
        errorMessage = error.getUserMessage();
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      set({
        isAuthenticated: false,
        oauthTokens: null,
        deviceCode: null,
        deviceCodeAbortController: null,
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  logout: async () => {
    // Reset state
    set({
      isAuthenticated: false,
      oauthTokens: null,
      user: null,
      organizations: [],
      activeOrganizationId: null,
      activeOrganization: null,
      activeProject: null,
      isPro: false,
      deviceCode: null,
      error: null,
    });
    await get().setOAuthTokens(null);
  },

  setError: (error: string | null) => {
    if (error === null) {
      // If clearing error, also cancel any in-progress device code flow
      const controller = get().deviceCodeAbortController;
      if (controller) {
        controller.abort();
      }
      set({ error: null, isLoading: false, deviceCode: null, deviceCodeAbortController: null });
    } else {
      set({ error });
    }
  },

  setActiveOrganization: (orgId: string) => {
    set((state) => {
      const org = state.organizations.find((o) => o.id === orgId) || null;
      const accessArr = org?.subscription?.access || [];
      const planName = org?.subscription?.plan?.name || '';
      const isPartner = planName.toLowerCase().includes('partner');
      const isTrialExpired = !isPartner && (org?.subscription?.plan_status === 'trial_expired' || org?.subscription?.plan_status === 'expired');
      const isPro = accessArr.includes('figma_plugin') && org?.current_user_seat_type === 'EDITOR' && !isTrialExpired;

      if (org) {
        AsyncMessageChannel.ReactInstance.message({
          type: AsyncMessageTypes.SET_ACTIVE_ORGANIZATION_ID,
          activeOrganizationId: org.id,
        });
      }

      return {
        activeOrganization: org,
        activeOrganizationId: org?.id || null,
        activeProject: org?.projects?.data?.[0] || null,
        isPro,
      };
    });
    // Fetch projects if needed
    get().fetchProjects(orgId);
  },

  setActiveProject: (projectId: string) => {
    set((state) => {
      const project = state.activeOrganization?.projects?.data?.find(p => p.id === projectId) || null;
      return { activeProject: project };
    });
  },

  setOAuthTokens: async (tokens: OAuthTokens | null) => {
    set({ oauthTokens: tokens, isAuthenticated: !!tokens });
    AsyncMessageChannel.ReactInstance.message({
      type: AsyncMessageTypes.SET_OAUTH_TOKENS,
      oauthTokens: tokens,
    });
  },

  fetchUserData: async (tokens: OAuthTokens, persistedProjectId?: string) => {
    let currentTokens = tokens;
    if (OAuthService.needsRefresh(currentTokens)) {
      try {
        await get().refreshTokens();
        currentTokens = get().oauthTokens!;
      } catch (err) {
        console.error('Failed to refresh tokens during fetchUserData', err);
        // Continue with old tokens, might fail but we already have an error handler
      }
    }
    const studioUrl = TOKENS_STUDIO_APP_URL;
    const apiBaseUrl = OAuthService.getApiBaseUrl(studioUrl);

    try {
      // 1. Fetch User Data
      const userResponse = await fetch(`${apiBaseUrl}/api/v1/auth/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!userResponse.ok) {
        throw new Error(`Failed to fetch user data: ${userResponse.status}`);
      }

      const resJson = await userResponse.json();
      const userDataRaw: Record<string, any> = resJson.data || resJson;
      const attrs = userDataRaw.attributes || userDataRaw;

      const user: UserData = {
        id: (userDataRaw.id as string) || (userDataRaw.uuid as string) || '',
        uuid: (userDataRaw.uuid as string) || (userDataRaw.id as string) || '',
        firstName: (attrs.first_name as string) || (attrs.firstName as string) || '',
        lastName: (attrs.last_name as string) || (attrs.lastName as string) || '',
        email: (attrs.email as string) || '',
        avatar: (attrs.avatar_url as string) || (attrs.avatar as string) || (attrs.logo_url as string) || '',
        fullName:
          (attrs.full_name as string) ||
          (attrs.fullName as string) ||
          `${(attrs.first_name as string) || (attrs.firstName as string) || ''} ${(attrs.last_name as string) || (attrs.lastName as string) || ''}`.trim() ||
          (attrs.name as string) ||
          '',
      };

      // 2. Fetch Organizations Data
      let organizations: Organization[] = [];

      try {
        const orgsResponse = await fetch(`${apiBaseUrl}/api/v1/organizations`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (orgsResponse.ok) {
          const orgsDataRaw = await orgsResponse.json();

          let orgsArray: any[] = [];
          if (Array.isArray(orgsDataRaw)) {
            orgsArray = orgsDataRaw;
          } else if (orgsDataRaw.organizations) {
            orgsArray = Array.isArray(orgsDataRaw.organizations) ? orgsDataRaw.organizations : (orgsDataRaw.organizations.data || []);
          } else if (orgsDataRaw.data) {
            orgsArray = Array.isArray(orgsDataRaw.data) ? orgsDataRaw.data : [];
          }

          organizations = orgsArray.map((org: any) => {
            const sub = (org.type && org.attributes ? org.attributes.subscription : org.subscription) || {};

            // Plan name mapping
            const rawPlanName = sub.current_plan || sub.plan?.name || 'Starter';
            // Capitalize first letter
            let planName = rawPlanName.charAt(0).toUpperCase() + rawPlanName.slice(1);
            const isPartner = rawPlanName.toLowerCase().includes('partner');

            if (!isPartner) {
              if (sub.plan_status === 'trial_expired' || sub.plan_status === 'expired') {
                planName = `${planName} Trial Expired`;
              } else if (sub.plan_status === 'trialing') {
                planName = `${planName} Trial`;
              }
            }

            // Billing date mapping
            let billingDate = sub.trial_ends_at || sub.billing_date || sub.billingDate || 'Endless';
            if (billingDate && billingDate !== 'Endless') {
              try {
                billingDate = new Date(billingDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                });
              } catch (e) {
                // Keep original if parsing fails
              }
            }

            // Price mapping
            let price = sub.price || sub.amount || sub.billing_amount;
            if (!price && rawPlanName.toLowerCase() === 'organisation') {
              price = '€599.00'; // Fallback observed in dashboard
            } else if (!price) {
              price = 'Free';
            }

            // Seats mapping
            const editorTotal = sub.editor_seats_total || sub.editorSeatsTotal || sub.seats_total || sub.seats || 0;
            const editorUsed = sub.editor_seats_used || sub.editorSeatsUsed || sub.seats_used || 0;
            const viewerTotal = sub.viewer_seats_total || sub.viewerSeatsTotal || 0;
            const viewerUsed = sub.viewer_seats_used || sub.viewerSeatsUsed || 0;

            return {
              id: org.type && org.attributes ? (org.id || '') : (org.uuid || org.id || ''),
              uuid: org.type && org.attributes ? (org.id || '') : (org.uuid || org.id || ''),
              name: org.type && org.attributes ? (org.attributes.name || '') : (org.name || ''),
              slug: org.type && org.attributes ? (org.attributes.slug || '') : (org.slug || ''),
              current_user_seat_type: org.type && org.attributes ? (org.attributes.current_user_seat_type || '') : (org.current_user_seat_type || ''),
              avatarUrl: org.type && org.attributes ? (org.attributes.logo_url || org.attributes.avatar_url || '') : (org.avatar_url || org.avatar || org.logo_url || ''),
              subscription: {
                ...sub,
                plan: {
                  id: sub.plan?.id || '',
                  name: planName,
                },
                price,
                billingDate,
                editor_seats_total: editorTotal,
                editor_seats_used: editorUsed,
                viewer_seats_total: viewerTotal,
                viewer_seats_used: viewerUsed,
              },
              projects: (org.type && org.attributes ? org.attributes.projects : org.projects) || { data: [] },
            };
          });
        }
      } catch (err) {
        console.warn('Could not fetch organizations via new backend, fallback missing depending on API.', err);
      }

      const storedId = get().activeOrganizationId;
      const activeOrganization = organizations.find((o) => o.id === storedId) || (organizations.length > 0 ? organizations[0] : null);

      let isPro = false;
      if (activeOrganization) {
        const accessArr = activeOrganization.subscription?.access || [];
        const planName = activeOrganization.subscription?.plan?.name || '';
        const isPartner = planName.toLowerCase().includes('partner');
        const isTrialExpired = !isPartner && (activeOrganization.subscription?.plan_status === 'trial_expired' || activeOrganization.subscription?.plan_status === 'expired');
        isPro = accessArr.includes('figma_plugin') && activeOrganization.current_user_seat_type === 'EDITOR' && !isTrialExpired;
      }

      const defaultProject = activeOrganization?.projects?.data?.find(p => p.id === persistedProjectId) || activeOrganization?.projects?.data?.[0] || null;

      set({
        user,
        organizations,
        activeOrganization,
        activeOrganizationId: activeOrganization?.id || null,
        activeProject: defaultProject,
        isPro,
        isLoading: false,
        isAuthenticated: true,
      });

      if (activeOrganization) {
        await get().fetchProjects(activeOrganization.id, persistedProjectId);

        if (activeOrganization.id !== storedId) {
          AsyncMessageChannel.ReactInstance.message({
            type: AsyncMessageTypes.SET_ACTIVE_ORGANIZATION_ID,
            activeOrganizationId: activeOrganization.id,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      set({ error: (error as Error).message, isLoading: false, isAuthenticated: false });
    }
  },

  fetchProjects: async (orgId: string, persistedProjectId?: string) => {
    const { oauthTokens } = get();
    if (!oauthTokens) return;

    const studioUrl = TOKENS_STUDIO_APP_URL;
    const apiBaseUrl = OAuthService.getApiBaseUrl(studioUrl);

    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/projects?organization_id=${orgId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${oauthTokens.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const projectsDataRaw = await response.json();
        let projectsArray: any[] = [];
        if (Array.isArray(projectsDataRaw)) {
          projectsArray = projectsDataRaw;
        } else if (projectsDataRaw.data) {
          projectsArray = Array.isArray(projectsDataRaw.data) ? projectsDataRaw.data : [];
        }

        const projects: Project[] = projectsArray.map((p: any) => ({
          id: p.id || p.uuid || '',
          name: p.name || (p.attributes?.name) || '',
          slug: p.slug || (p.attributes?.slug) || '',
        }));

        set((state) => {
          // Update the organization in the list and active organization if it matches
          const updatedOrganizations = state.organizations.map((org) => {
            if (org.id === orgId) {
              return { ...org, projects: { data: projects } };
            }
            return org;
          });

          const updatedActiveOrg = state.activeOrganization?.id === orgId
            ? { ...state.activeOrganization, projects: { data: projects } }
            : state.activeOrganization;

          return {
            organizations: updatedOrganizations,
            activeOrganization: updatedActiveOrg,
            activeProject: (state.activeOrganization?.id === orgId) ? (projects.find(p => p.id === persistedProjectId) || projects[0] || null) : state.activeProject,
          };
        });
      }
    } catch (err) {
      console.warn('Failed to fetch projects:', err);
    }
  },

  loadProjectTokens: async (projectId: string) => {
    const { oauthTokens, activeOrganization } = get();
    if (!oauthTokens || !activeOrganization) return;

    set({ isLoading: true });

    const studioUrl = TOKENS_STUDIO_APP_URL;
    const apiBaseUrl = OAuthService.getApiBaseUrl(studioUrl);

    try {
      const projectData = await fetchProjectDataRest(
        oauthTokens.accessToken,
        apiBaseUrl,
        projectId
      );

      if (projectData && projectData.tokens) {
        // Apply token set order and dispatch to Redux store
        const { tokens, themes, tokenSetOrder } = projectData;

        store.dispatch.tokenState.setTokenData({
          values: tokens as any,
          themes: themes,
          activeTheme: {},
          hasChangedRemote: false,
        });

        store.dispatch.tokenState.setRemoteData({
          tokens: tokens as any,
          themes,
          metadata: { tokenSetOrder },
        });

        const stringifiedRemoteTokens = JSON.stringify(compact([tokens, themes, TokenFormat.format]), null, 2);
        store.dispatch.tokenState.setLastSyncedState(stringifiedRemoteTokens);

        notifyToUI('Successfully loaded project tokens', { error: false });
      } else {
        notifyToUI('Project has no tokens or could not load tokens.', { error: true });
      }
    } catch (error) {
      console.error('Failed to load project tokens:', error);
      notifyToUI('Failed to load project tokens', { error: true });
    } finally {
      set({ isLoading: false });
    }
  },

  refreshTokens: async () => {
    const { oauthTokens } = get();
    if (!oauthTokens || !oauthTokens.refreshToken) return;

    try {
      const studioUrl = TOKENS_STUDIO_APP_URL;
      const newTokens = await OAuthService.refreshTokens(null, oauthTokens.refreshToken, studioUrl);
      await get().setOAuthTokens(newTokens);
    } catch (error) {
      console.error('Failed to refresh tokens:', error);
      // If refresh fails, we might want to logout or show error
      // set({ isAuthenticated: false, oauthTokens: null });
      throw error;
    }
  }
}));
