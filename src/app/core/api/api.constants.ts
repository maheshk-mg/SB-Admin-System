/**
 * API path constants. Base URL is provided by environment; paths are relative.
 */
export const API_PATHS = {
  auth: {
    login: 'auth/login',
    register: 'auth/register',
  },
} as const;
