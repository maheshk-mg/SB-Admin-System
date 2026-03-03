import { HttpInterceptorFn } from '@angular/common/http';

import { environment } from '../../../environments/environment';

const AUTH_TOKEN_KEY = 'auth_token';

/**
 * Interceptor that:
 * - Prepends API base URL to relative request URLs
 * - Adds Authorization header when a token is present
 */
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const baseUrl = environment.apiBaseUrl;
  const isRelative = !req.url.startsWith('http://') && !req.url.startsWith('https://');
  const url = isRelative ? `${baseUrl.replace(/\/$/, '')}/${req.url.replace(/^\//, '')}` : req.url;
  let headers = req.headers;
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }
  return next(req.clone({ url, headers }));
};
