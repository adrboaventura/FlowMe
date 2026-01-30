
import { AuthProviderType, Tenant, User, UserRole } from '../types';

/**
 * ENTERPRISE IDENTITY PROVIDER INTERFACE
 * Standardizes the handshake for any SSO system.
 */
export interface AuthProvider {
  type: AuthProviderType;
  getLoginUrl(tenant: Tenant): string;
  extractUser(response: any, tenant: Tenant): User;
}

/**
 * GOOGLE OAUTH PROVIDER
 */
export const GoogleProvider: AuthProvider = {
  type: 'google',
  getLoginUrl: () => 'https://accounts.google.com/o/oauth2/v2/auth...',
  extractUser: (response: any) => ({
    id: response.sub,
    name: response.name,
    email: response.email,
    picture: response.picture,
    role: UserRole.WORKER
  })
};

/**
 * AUTH0 ENTERPRISE PROVIDER
 */
export const Auth0Provider: AuthProvider = {
  type: 'auth0',
  getLoginUrl: (tenant: Tenant) => {
    const config = JSON.parse(tenant.authConfigJson);
    return `https://${config.domain}/authorize?client_id=${config.client_id}&response_type=code&scope=openid profile email`;
  },
  extractUser: (response: any, tenant: Tenant) => ({
    id: `auth0|${response.sub}`,
    name: response.name,
    email: response.email,
    picture: `https://api.dicebear.com/7.x/initials/svg?seed=${response.name}`,
    role: UserRole.MANAGER,
    companyId: tenant.companyId,
    tenantId: tenant.id
  })
};

/**
 * AZURE AD (MICROSOFT ENTRA ID) PROVIDER
 */
export const AzureADProvider: AuthProvider = {
  type: 'azure_ad',
  getLoginUrl: (tenant: Tenant) => {
    const config = JSON.parse(tenant.authConfigJson);
    return `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/authorize?client_id=${config.client_id}...`;
  },
  extractUser: (response: any, tenant: Tenant) => ({
    id: `azad|${response.oid}`,
    name: response.displayName,
    email: response.userPrincipalName,
    picture: `https://api.dicebear.com/7.x/initials/svg?seed=${response.displayName}`,
    role: UserRole.ADMIN,
    companyId: tenant.companyId,
    tenantId: tenant.id
  })
};

export const providers: Record<AuthProviderType, AuthProvider> = {
  google: GoogleProvider,
  auth0: Auth0Provider,
  azure_ad: AzureADProvider,
  custom_oidc: Auth0Provider // Fallback to OIDC logic
};
