import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatDividerModule,
    MatTabsModule,
    MatSnackBarModule,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  profileForm: FormGroup;
  notificationForm: FormGroup;
  saving = signal(false);
  avatarPreview = signal<string | null>(null);
  avatarFileName = signal('');

  languages = ['English', 'Spanish', 'French', 'German', 'Japanese'];
  timezones = ['UTC', 'EST', 'PST', 'CST', 'IST', 'GMT', 'CET'];
  roles = ['Admin', 'Editor', 'Viewer', 'Manager'];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    public auth: AuthService,
  ) {
    const user = this.auth.user();
    this.profileForm = this.fb.group({
      // firstName: [user?.firstName || '', Validators.required],
      name: [user?.name || '', Validators.required],
      email: [user?.email || '', [Validators.required, Validators.email]],
      phone: [''],
      bio: [''],
      website: [''],
      company: [''],
      role: ['Admin'],
      address: [''],
      city: [''],
      country: [''],
      zipCode: [''],
      language: ['English'],
      timezone: ['UTC'],
    });

    this.notificationForm = this.fb.group({
      emailNotifications: [true],
      pushNotifications: [true],
      orderUpdates: [true],
      securityAlerts: [true],
      newsletter: [false],
      productUpdates: [true],
    });
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.avatarFileName.set(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        this.avatarPreview.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  removeAvatar(): void {
    this.avatarPreview.set(null);
    this.avatarFileName.set('');
  }

  async saveProfile(): Promise<void> {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    this.saving.set(false);
    this.snackBar.open('Profile updated successfully', 'Close', {
      duration: 3000,
      panelClass: 'snackbar-success',
    });
  }

  async saveNotifications(): Promise<void> {
    this.saving.set(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    this.saving.set(false);
    this.snackBar.open('Notification preferences saved', 'Close', {
      duration: 3000,
      panelClass: 'snackbar-success',
    });
  }
}
