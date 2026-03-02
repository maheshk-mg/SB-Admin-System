import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';

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

  constructor(private router: Router) {}

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

  async login(payload: LoginPayload): Promise<{ success: boolean; error?: string }> {
    this.loading.set(true);
    try {
      await this.simulateDelay(800);

      if (payload.email === 'admin@demo.com' && payload.password === 'Password123!') {
        const user: User = {
          id: '1',
          email: payload.email,
          firstName: 'Admin',
          lastName: 'User',
        };
        this.persistSession('mock-jwt-token-xyz', user);
        return { success: true };
      }

      // Accept any well-formed credentials for demo purposes
      const user: User = {
        id: crypto.randomUUID(),
        email: payload.email,
        firstName: payload.email.split('@')[0],
        lastName: 'User',
      };
      this.persistSession('mock-jwt-token-' + Date.now(), user);
      return { success: true };
    } catch {
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    } finally {
      this.loading.set(false);
    }
  }

  async register(payload: RegisterPayload): Promise<{ success: boolean; error?: string }> {
    this.loading.set(true);
    try {
      await this.simulateDelay(1000);

      const user: User = {
        id: crypto.randomUUID(),
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
      };
      this.persistSession('mock-jwt-token-' + Date.now(), user);
      return { success: true };
    } catch {
      return { success: false, error: 'Registration failed. Please try again.' };
    } finally {
      this.loading.set(false);
    }
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  private simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
