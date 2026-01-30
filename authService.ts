
import { Tenant, User, UserRole } from '../types';
import { providers } from './authProviders';

/**
 * FLOWME IDENTITY MANAGEMENT SERVICE
 */

const MOCK_TENANTS: Tenant[] = [
  {
    id: 'ten_swinetech',
    companyId: 'c_swinetech',
    name: 'SwineTech Operations',
    loginDomain: 'swinetech.com',
    authProvider: 'azure_ad',
    authConfigJson: JSON.stringify({ tenantId: 'swine-msft-001', client_id: 'swine-cid-123' }),
    isActive: true,
    brandColor: '#0078d4'
  },
  {
    id: 'ten_northcreek',
    companyId: 'c_northcreek',
    name: 'North Creek Farms',
    loginDomain: 'northcreek.io',
    authProvider: 'auth0',
    authConfigJson: JSON.stringify({ domain: 'northcreek.auth0.com', client_id: 'nc-cid-456' }),
    isActive: true,
    brandColor: '#eb5424'
  }
];

export const authService = {
  /**
   * Identifies the tenant based on email domain.
   */
  resolveTenantFromEmail(email: string): Tenant | null {
    const domain = email.split('@')[1];
    if (!domain) return null;
    return MOCK_TENANTS.find(t => t.loginDomain === domain.toLowerCase() && t.isActive) || null;
  },

  /**
   * Resolves tenant by unique name/identifier (for portal logins).
   */
  resolveTenantByName(name: string): Tenant | null {
    const normalized = name.toLowerCase().replace(/\s+/g, '');
    return MOCK_TENANTS.find(t => t.name.toLowerCase().replace(/\s+/g, '') === normalized) || null;
  },

  /**
   * Orchestrates the enterprise SSO handshake.
   */
  async triggerEnterpriseLogin(tenant: Tenant): Promise<User> {
    const provider = providers[tenant.authProvider];
    const loginUrl = provider.getLoginUrl(tenant);
    
    console.log(`[FlowMe Security] Initiating SSO Handshake for ${tenant.name} via ${tenant.authProvider}`);
    console.log(`[FlowMe Security] Redirecting to: ${loginUrl}`);
    
    // Simulate real SSO delay
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Mock response from provider - In a real app, this data comes from an OAuth token
    const mockProviderResponse = {
      sub: 'emp_99',
      oid: 'ms-oid-777',
      name: `${tenant.name} Professional`,
      email: `staff@${tenant.loginDomain}`,
      displayName: `${tenant.name} Staff`,
      userPrincipalName: `staff@${tenant.loginDomain}`
    };

    const user = provider.extractUser(mockProviderResponse, tenant);

    // SECURITY COMPLIANCE: Domain Enforcement
    if (!user.email.endsWith(`@${tenant.loginDomain}`)) {
      throw new Error(`Security Violation: User domain does not match tenant policy for ${tenant.name}.`);
    }

    // We set a default display name if the provider didn't give a specific one
    user.displayName = user.name;
    user.createdAt = Date.now();
    user.updatedAt = Date.now();
    user.authProvider = tenant.authProvider;

    return user;
  }
};
