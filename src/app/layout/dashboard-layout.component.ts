import { Component, ViewChild, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';

interface NavItem {
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.scss',
})
export class DashboardLayoutComponent implements OnInit, OnDestroy {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  isMobile = signal(false);
  collapsed = signal(false);
  notificationCount = signal(5);
  private bpSub!: Subscription;

  navItems: NavItem[] = [
    { icon: 'dashboard', label: 'Dashboard', route: '/dashboard' },
    { icon: 'settings', label: 'Settings', route: '/dashboard/settings' },
  ];

  notifications = [
    { icon: 'person_add', text: 'New user registered', time: '2 min ago', read: false },
    { icon: 'shopping_cart', text: 'New order #1234 placed', time: '15 min ago', read: false },
    { icon: 'warning', text: 'Server load above 80%', time: '1 hour ago', read: false },
    { icon: 'update', text: 'System update available', time: '3 hours ago', read: true },
    { icon: 'check_circle', text: 'Backup completed', time: '5 hours ago', read: true },
  ];

  constructor(
    public auth: AuthService,
    private bp: BreakpointObserver,
  ) {}

  ngOnInit(): void {
    this.bpSub = this.bp
      .observe([Breakpoints.XSmall, Breakpoints.Small])
      .subscribe(result => {
        this.isMobile.set(result.matches);
        if (result.matches) {
          this.collapsed.set(false);
        }
      });
  }

  ngOnDestroy(): void {
    this.bpSub?.unsubscribe();
  }

  toggleSidenav(): void {
    if (this.isMobile()) {
      this.sidenav.toggle();
    } else {
      this.collapsed.update(v => !v);
    }
  }

  onNavClick(): void {
    if (this.isMobile()) {
      this.sidenav.close();
    }
  }

  markAllRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.notificationCount.set(0);
  }

  logout(): void {
    this.auth.logout();
  }
}
