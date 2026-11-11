import {environment} from "@shared-lib/env/environment";
import {resolveUrl} from "@shared-lib/utils/url.helper";

export const ADMIN_REALM_ROLE = 'Admin';
export const AUDITOR_REALM_ROLE = 'Auditor';

export const BFF_REQUEST_HEADER = 'X-Requested-With';
export const BFF_REQUEST_HEADER_VALUE = 'JavaScript';

export const getBffUrl = (endpoint: 'login' | 'logout' | 'me'): string => {
  const apiUrl = (environment.localLearningAPIURL ?? environment.globalLearningApiUrl ?? '').replace(/\/+$/, '');
  return resolveUrl(`${apiUrl}/bff/${endpoint}`);
};

export const getAccountManagementUrl = (): string =>
  `${environment.keycloak.url}/realms/${environment.keycloak.realm}/account`;
