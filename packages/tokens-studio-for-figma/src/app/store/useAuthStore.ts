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
    activeOrganization: Organization | null;
    activeProject: Project | null;
    error: string | null;
    isLoading: boolean;
    isPro: boolean;
    deviceCode: DeviceCodeState | null; // Device code info for UI display
    _deviceCodeAbortController: AbortController | null;
    loginWithOAuth: () => Promise<void>;
    logout: () => Promise<void>;
    setError: (error: string | null) => void;
    setActiveOrganization: (orgId: string) => void;
    setActiveProject: (projectId: string) => void;
    setOAuthTokens: (tokens: OAuthTokens | null) => Promise<void>;
    fetchUserData: (tokens: OAuthTokens) => Promise<void>;
    fetchProjects: (orgId: string) => Promise<void>;
    loadProjectTokens: (projectId: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    isAuthenticated: false,
    oauthTokens: null,
    user: null,
    organizations: [],
    activeOrganization: null,
    activeProject: null,
    error: null,
    isLoading: false,
    isPro: false,
    deviceCode: null,
    _deviceCodeAbortController: null,

    loginWithOAuth: async () => {
        set({ isLoading: true, error: null, deviceCode: null });

        try {
            const studioUrl = 'production.tokens.studio';
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
                set({ _deviceCodeAbortController: abortController });

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
                set({ deviceCode: null, _deviceCodeAbortController: null });
            } else {
                // Fallback or old PKCE Flow
                const result = await OAuthService.performPKCEFlow(studioUrl);
                tokens = result.tokens;
            }

            // POLL FOR TOKEN ... (already handled above)

            await get().fetchUserData(tokens);
            await get().setOAuthTokens(tokens);

        } catch (error) {
            const errorMessage =
                error instanceof OAuthError
                    ? error.getUserMessage()
                    : error instanceof Error
                        ? error.message
                        : 'OAuth login failed';

            set({
                isAuthenticated: false,
                oauthTokens: null,
                deviceCode: null,
                _deviceCodeAbortController: null,
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
            const controller = get()._deviceCodeAbortController;
            if (controller) {
                controller.abort();
            }
            set({ error: null, isLoading: false, deviceCode: null, _deviceCodeAbortController: null });
        } else {
            set({ error });
        }
    },

    setActiveOrganization: (orgId: string) => {
        set((state) => {
            const org = state.organizations.find(o => o.id === orgId) || null;
            return {
                activeOrganization: org,
                activeProject: org?.projects?.data?.[0] || null,
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

    fetchUserData: async (tokens: OAuthTokens) => {
        const studioUrl = 'production.tokens.studio';
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
                id: (userDataRaw.id as string) || (userDataRaw.uuid as string) || "",
                uuid: (userDataRaw.uuid as string) || (userDataRaw.id as string) || "",
                firstName: (attrs.first_name as string) || (attrs.firstName as string) || "",
                lastName: (attrs.last_name as string) || (attrs.lastName as string) || "",
                email: (attrs.email as string) || "",
                avatar: (attrs.avatar_url as string) || (attrs.avatar as string) || (attrs.logo_url as string) || "",
                fullName:
                    (attrs.full_name as string) ||
                    (attrs.fullName as string) ||
                    `${(attrs.first_name as string) || (attrs.firstName as string) || ""} ${(attrs.last_name as string) || (attrs.lastName as string) || ""}`.trim() ||
                    (attrs.name as string) ||
                    "",
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

                    organizations = orgsArray.map((org: any) => ({
                        id: org.type && org.attributes ? (org.id || '') : (org.uuid || org.id || ''),
                        uuid: org.type && org.attributes ? (org.id || '') : (org.uuid || org.id || ''),
                        name: org.type && org.attributes ? (org.attributes.name || '') : (org.name || ''),
                        slug: org.type && org.attributes ? (org.attributes.slug || '') : (org.slug || ''),
                        avatarUrl: org.type && org.attributes ? (org.attributes.logo_url || org.attributes.avatar_url || '') : (org.avatar_url || org.avatar || org.logo_url || ''),
                        subscription: org.type && org.attributes ? org.attributes.subscription : org.subscription,
                        projects: (org.type && org.attributes ? org.attributes.projects : org.projects) || { data: [] },
                    }));
                    console.log('useAuthStore: fetched organizations', organizations);
                }
            } catch (err) {
                console.warn('Could not fetch organizations via new backend, fallback missing depending on API.', err);
            }

            const activeOrganization = organizations.length > 0 ? organizations[0] : null;

            const isPro = organizations.some(org => {
                const status = org.subscription?.subscription_status;
                return status === 'active' || status === 'trialing' || status === 'past_due';
            });
            console.log('useAuthStore: isPro calculation', { isPro, subscriptionStatuses: organizations.map(o => o.subscription?.subscription_status) });

            set({
                user,
                organizations,
                activeOrganization,
                activeProject: activeOrganization?.projects?.data?.[0] || null,
                isPro,
                isLoading: false,
                isAuthenticated: true,
            });

            if (activeOrganization) {
                await get().fetchProjects(activeOrganization.id);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            set({ error: (error as Error).message, isLoading: false, isAuthenticated: false });
        }
    },

    fetchProjects: async (orgId: string) => {
        const { oauthTokens } = get();
        if (!oauthTokens) return;

        const studioUrl = 'production.tokens.studio';
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

                console.log('Fetched projects:', projects); // Add debug log

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
                        activeProject: (state.activeOrganization?.id === orgId) ? (projects[0] || null) : state.activeProject,
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

        const studioUrl = 'production.tokens.studio';
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
    }
}));
