import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminService } from './services/admin.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="shell" *ngIf="admin.isLoggedIn(); else bare">
      <aside class="sidebar">
        <div class="logo">⚡ Volt<b>Edge</b><span>Admin</span></div>
        <nav>
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">📊 Dashboard</a>
          <a routerLink="/products" routerLinkActive="active">📦 Products</a>
          <a routerLink="/orders" routerLinkActive="active">🧾 Orders</a>
          <a routerLink="/users" routerLinkActive="active">👥 Users</a>
        </nav>
        <div class="side-foot">
          <div class="who">{{ admin.user()?.name }}<span>{{ admin.user()?.role }}</span></div>
          <button class="btn btn-ghost btn-sm" (click)="logout()">Logout</button>
        </div>
      </aside>
      <main class="content"><router-outlet></router-outlet></main>
    </div>
    <ng-template #bare><router-outlet></router-outlet></ng-template>
  `,
  styles: [`
    .shell { display:flex; min-height:100vh; }
    .sidebar { width:240px; background:var(--ink); color:#d9c9cb; display:flex; flex-direction:column; padding:22px 16px; position:sticky; top:0; height:100vh; }
    .logo { font-size:20px; font-weight:500; display:flex; align-items:center; gap:6px; color:#fff; margin-bottom:28px; }
    .logo span { font-size:11px; background:var(--red); padding:2px 7px; border-radius:6px; margin-left:4px; text-transform:uppercase; letter-spacing:.5px; }
    nav { display:flex; flex-direction:column; gap:4px; flex:1; }
    nav a { color:#c9b8ba; padding:11px 14px; border-radius:9px; font-size:14.5px; font-weight:500; }
    nav a:hover { background:rgba(255,255,255,.06); color:#fff; }
    nav a.active { background:var(--red); color:#fff; }
    .side-foot { border-top:1px solid rgba(255,255,255,.1); padding-top:16px; display:flex; flex-direction:column; gap:10px; }
    .who { font-size:14px; color:#fff; font-weight:600; display:flex; flex-direction:column; }
    .who span { font-size:11px; color:#b39a9c; text-transform:uppercase; font-weight:500; }
    .content { flex:1; padding:28px 32px; overflow-x:auto; }
    @media (max-width:720px){ .sidebar { width:64px; } .logo b,.logo span,nav a span,.who { display:none; } }
  `],
})
export class AppComponent {
  constructor(public admin: AdminService, private router: Router) {}
  logout() { this.admin.logout(); this.router.navigate(['/login']); }
}
