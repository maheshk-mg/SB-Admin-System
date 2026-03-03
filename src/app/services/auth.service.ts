import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { API_PATHS } from '../core/api/api.constants';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

/** API auth response – supports common shapes: { token, user } or { data: { token, user } } */
interface AuthApiResponse {
  token?: string;
  access_token?: string;
  user?: User;
  data?: { token?: string; access_token?: string; user?: User };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  private currentUser = signal<User | null>(this.loadUser());
  private loading = signal(false);

  readonly user = this.currentUser.asReadonly();
  readonly isLoading = this.loading.asReadonly();
  readonly isAuthenticated = computed(() => !!this.currentUser());
  readonly userInitials = computed(() => {
    const u = this.currentUser();
    return u ? `${u.firstName[0]}${u.lastName[0]}`.toUpperCase() : '';
  });
  readonly fullName = computed(() => {
    const u = this.currentUser();
    return u ? `${u.firstName} ${u.lastName}` : '';
  });

  constructor(
    private router: Router,
    private http: HttpClient,
  ) {}

  private loadUser(): User | null {
    try {
      const raw = localStorage.getItem(this.USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private persistSession(token: string, user: User): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUser.set(user);
  }

  /** Call after successful register/login from component (e.g. when API is called in the component). */
  setSession(token: string, user: User): void {
    this.persistSession(token, user);
  }

  async login(payload: LoginPayload): Promise<{ success: boolean; error?: string }> {
    this.loading.set(true);
    try {
      const res = await firstValueFrom(
        this.http.post<AuthApiResponse>(API_PATHS.auth.login, payload).pipe(
          map((body) => this.handleAuthResponse(body)),
          catchError((err) => of({ success: false as const, error: this.getErrorMessage(err) })),
        ),
      );
      if (res.success && res.token && res.user) {
        this.persistSession(res.token, res.user);
        return { success: true };
      }
      return { success: false, error: res.error ?? 'Login failed.' };
    } catch {
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    } finally {
      this.loading.set(false);
    }
  }

  async register(payload: RegisterPayload): Promise<{ success: boolean; error?: string }> {
    this.loading.set(true);
    try {
      const res = await firstValueFrom(
        this.http.post<AuthApiResponse>(API_PATHS.auth.register, payload).pipe(
          map((body) => this.handleAuthResponse(body)),
          catchError((err) => of({ success: false as const, error: this.getErrorMessage(err) })),
        ),
      );
      if (res.success && res.token && res.user) {
        this.persistSession(res.token, res.user);
        return { success: true };
      }
      return { success: false, error: res.error ?? 'Registration failed.' };
    } catch {
      return { success: false, error: 'Registration failed. Please try again.' };
    } finally {
      this.loading.set(false);
    }
  }

  private handleAuthResponse(body: AuthApiResponse): {
    success: boolean;
    token?: string;
    user?: User;
    error?: string;
  } {
    const data = body.data ?? body;
    const token = data.token ?? data.access_token ?? body.token ?? body.access_token;
    const user = data.user ?? body.user;
    if (token && user) {
      return { success: true, token, user };
    }
    return { success: false, error: 'Invalid response from server.' };
  }

  private getErrorMessage(err: { status?: number; error?: { message?: string }; message?: string }): string {
    if (err?.error?.message) return err.error.message;
    if (err?.message) return err.message;
    if (err?.status === 401) return 'Invalid email or password.';
    if (err?.status === 409) return 'An account with this email already exists.';
    if (err?.status && err.status >= 400) return 'Request failed. Please try again.';
    return 'An unexpected error occurred. Please try again.';
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }
}
