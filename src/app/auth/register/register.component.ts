import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  form: FormGroup;
  hidePassword = signal(true);
  hideConfirm = signal(true);
  errorMessage = signal('');

  togglePassword(): void {
    this.hidePassword.update(v => !v);
  }

  toggleConfirm(): void {
    this.hideConfirm.update(v => !v);
  }

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
  ) {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), this.passwordStrength]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]],
    }, { validators: this.passwordMatch });
  }

  get isLoading() {
    return this.auth.isLoading;
  }

  private passwordStrength(control: AbstractControl): ValidationErrors | null {
    const val = control.value;
    if (!val) return null;
    const hasUpper = /[A-Z]/.test(val);
    const hasLower = /[a-z]/.test(val);
    const hasNumber = /\d/.test(val);
    if (!hasUpper || !hasLower || !hasNumber) {
      return { passwordStrength: true };
    }
    return null;
  }

  private passwordMatch(group: AbstractControl): ValidationErrors | null {
    const pass = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    if (pass && confirm && pass !== confirm) {
      return { passwordMismatch: true };
    }
    return null;
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage.set('');
    const { firstName, lastName, email, password } = this.form.value;
    const result = await this.auth.register({ firstName, lastName, email, password });

    if (result.success) {
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMessage.set(result.error || 'Registration failed.');
    }
  }

  getFieldError(field: string): string {
    const ctrl = this.form.get(field)!;
    if (ctrl.hasError('required')) {
      const labels: Record<string, string> = {
        firstName: 'First name',
        lastName: 'Last name',
        email: 'Email',
        password: 'Password',
        confirmPassword: 'Password confirmation',
      };
      return `${labels[field] || field} is required`;
    }
    if (ctrl.hasError('email')) return 'Enter a valid email address';
    if (ctrl.hasError('minlength')) {
      const len = ctrl.getError('minlength').requiredLength;
      return `Must be at least ${len} characters`;
    }
    if (ctrl.hasError('passwordStrength')) {
      return 'Must include uppercase, lowercase, and a number';
    }
    return '';
  }

  getConfirmError(): string {
    const ctrl = this.form.get('confirmPassword')!;
    if (ctrl.hasError('required')) return 'Please confirm your password';
    if (this.form.hasError('passwordMismatch')) return 'Passwords do not match';
    return '';
  }
}
