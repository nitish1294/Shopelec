import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../services/admin.service';

@Component({
  selector: 'admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="wrap">
      <div class="box">
        <div class="logo">⚡ Volt<b>Edge</b> <span>Admin</span></div>
        <h2>Sign in to the dashboard</h2>
        <div class="err" *ngIf="error()">{{ error() }}</div>
        <label>Email</label>
        <input [(ngModel)]="email" type="email" placeholder="admin@voltedge.in" style="margin-bottom:14px">
        <label>Password</label>
        <input [(ngModel)]="password" type="password" placeholder="Password" style="margin-bottom:18px">
        <button class="btn" style="width:100%" [disabled]="loading()" (click)="submit()">
          {{ loading() ? 'Signing in…' : 'Sign in' }}
        </button>
        <p class="hint">Default super admin: admin&#64;voltedge.in / admin12345</p>
      </div>
    </div>
  `,
  styles: [`
    .wrap { min-height:100vh; display:grid; place-items:center; background:linear-gradient(160deg,#2a1416,var(--ink)); padding:20px; }
    .box { background:#fff; border-radius:18px; padding:36px 32px; width:100%; max-width:380px; box-shadow:0 20px 50px rgba(0,0,0,.3); }
    .logo { font-size:22px; font-weight:500; margin-bottom:22px; }
    .logo span { font-size:11px; background:var(--red); color:#fff; padding:2px 7px; border-radius:6px; text-transform:uppercase; }
    h2 { font-size:18px; margin:0 0 20px; }
    label { font-size:13px; font-weight:600; display:block; margin-bottom:6px; }
    .err { background:var(--red-soft); color:var(--red-dark); padding:10px 12px; border-radius:9px; font-size:13.5px; margin-bottom:14px; }
    .hint { font-size:12px; color:var(--muted); text-align:center; margin-top:16px; }
  `],
})
export class LoginComponent {
  email = ''; password = ''; loading = signal(false); error = signal('');
  constructor(private admin: AdminService, private router: Router) {}
  submit() {
    if (!this.email || !this.password) { this.error.set('Enter email and password.'); return; }
    this.loading.set(true); this.error.set('');
    this.admin.login(this.email, this.password).subscribe({
      next: (res: any) => {
        if (res.user.role !== 'admin' && res.user.role !== 'superadmin') {
          this.error.set('This account is not an admin.'); this.admin.logout(); this.loading.set(false); return;
        }
        this.router.navigate(['/']);
      },
      error: (e: any) => { this.error.set(e?.error?.detail || 'Login failed.'); this.loading.set(false); },
    });
  }
}
