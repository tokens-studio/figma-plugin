export interface OAuthConfig {
    frontend_base_url: string;
    auth_domain: string;
    legacy_graphql_endpoint: string;
    auth_graphql_endpoint: string;
    oauth: {
        authorization_endpoint: string;
        token_endpoint: string;
        client_id: string;
        // Legacy PKCE flow fields (for old backend like app.tokens.studio)
        generate_keypair?: string;
        callback?: string;
        read_code?: string;
    };
    features: Record<string, any>;
}

/**
 * Response from keypair generation endpoint (for PKCE flow)
 */
export interface KeypairResponse {
    read_key: string;
    write_key: string;
}

/**
 * Response from read_code endpoint (for PKCE flow)
 */
export interface AuthCodeResponse {
    read_key: string;
    oauth_code: string;
}

/**
 * Response from device authorization endpoint (POST /oauth/authorize_device)
 * RFC 8628 Device Authorization Grant
 */
export interface DeviceAuthorizationResponse {
    device_code: string; // Long code for polling (keep secret)
    user_code: string; // Short code for user to enter (e.g., "WXYZ-ABCD")
    verification_uri: string; // URL where user enters code
    verification_uri_complete?: string; // URL with code pre-filled (for QR codes)
    expires_in: number; // Seconds until code expires (900 = 15 minutes)
    interval: number; // Minimum seconds between polling requests (5)
}

export interface TokenResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
}

export interface OAuthTokens {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresAt: number; // Unix timestamp
}

export type UserData = {
    id: string;
    uuid: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar: string;
    fullName: string;
};

export type Project = {
    id: string;
    name: string;
    slug?: string;
};

export type Organization = {
    name: string;
    avatarUrl?: string;
    id: string;
    slug?: string;
    subscription?: {
        id: string;
        status: string;
        plan: {
            id: string;
            name: string;
        };
        price?: string;
        billingDate?: string;
    };
    projects: {
        data: Project[];
    };
};

export type OrganizationsResponse = {
    organizations: {
        data: Organization[];
    };
} | null;
