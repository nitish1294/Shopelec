import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="auth-wrap">
      <div class="auth-card">
        <div class="auth-side">
          <h2>Welcome back</h2>
          <p>Log in to track orders, save your cart, and check out faster.</p>
          <ul>
            <li>✓ Faster checkout</li>
            <li>✓ Order history &amp; tracking</li>
            <li>✓ Exclusive member offers</li>
          </ul>
        </div>
        <div class="auth-form">
          <h3>Login to VoltEdge</h3>
          <div class="err" *ngIf="error()">{{ error() }}</div>
          <label>Email<input [(ngModel)]="email" type="email" placeholder="you@email.com"></label>
          <label>Password<input [(ngModel)]="password" type="password" placeholder="Your password"></label>
          <button class="btn-primary" style="width:100%" [disabled]="loading()" (click)="submit()">
            {{ loading() ? 'Logging in…' : 'Login' }}
          </button>
          <p class="switch">New to VoltEdge? <a routerLink="/signup">Create an account</a></p>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .auth-wrap { padding:56px 24px; display:grid; place-items:center; }
    .auth-card { display:flex; max-width:820px; width:100%; background:#fff; border:1px solid var(--border); border-radius:20px; overflow:hidden; box-shadow:0 16px 40px rgba(214,40,40,.08); }
    .auth-side { background:linear-gradient(160deg,var(--red),var(--red-dark)); color:#fff; padding:44px 34px; width:320px; flex-shrink:0; }
    .auth-side h2 { margin:0 0 12px; font-size:26px; }
    .auth-side p { color:#ffe0e0; font-size:14.5px; line-height:1.55; }
    .auth-side ul { list-style:none; padding:0; margin:24px 0 0; display:flex; flex-direction:column; gap:10px; font-size:14px; color:#ffecec; }
    .auth-form { padding:40px 34px; flex:1; }
    .auth-form h3 { margin:0 0 20px; font-size:20px; }
    .switch { font-size:14px; color:var(--muted); margin-top:16px; text-align:center; }
    .switch a { color:var(--red); font-weight:600; }
    .err { background:var(--red-soft); color:var(--red-dark); border:1px solid #f2c9c9; padding:10px 12px; border-radius:10px; font-size:13.5px; margin-bottom:14px; }
    @media (max-width:640px){ .auth-side { display:none; } }
  `],
})
export class LoginComponent {
  email = ''; password = '';
  loading = signal(false);
  error = signal('');
  constructor(private auth: AuthService, private router: Router, private route: ActivatedRoute) {}
  submit() {
    if (!this.email || !this.password) { this.error.set('Enter email and password.'); return; }
    this.loading.set(true); this.error.set('');
    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        const redirect = this.route.snapshot.queryParamMap.get('redirect') || '/';
        this.router.navigateByUrl(redirect);
      },
      error: (e) => { this.error.set(e?.error?.detail || 'Login failed.'); this.loading.set(false); },
    });
  }
}
