import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../services/admin.service';

@Component({
  selector: 'admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <h1>Dashboard</h1>
    <p class="sub">Overview of your store</p>
    <div class="cards">
      <a routerLink="/products" class="stat"><span class="ic">📦</span><b>{{ s()?.products ?? '—' }}</b><span>Products</span></a>
      <a routerLink="/orders" class="stat"><span class="ic">🧾</span><b>{{ s()?.orders ?? '—' }}</b><span>Orders</span></a>
      <a routerLink="/users" class="stat"><span class="ic">👥</span><b>{{ s()?.users ?? '—' }}</b><span>Users</span></a>
      <div class="stat"><span class="ic">💰</span><b>₹{{ (s()?.revenue ?? 0) | number }}</b><span>Revenue</span></div>
    </div>
  `,
  styles: [`
    h1 { font-size:26px; margin:0 0 4px; }
    .sub { color:var(--muted); margin:0 0 24px; }
    .cards { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:18px; }
    .stat { background:#fff; border:1px solid var(--border); border-radius:14px; padding:22px; display:flex; flex-direction:column; gap:4px; text-decoration:none; color:var(--ink); transition:.15s; }
    .stat:hover { transform:translateY(-2px); box-shadow:0 10px 24px rgba(0,0,0,.06); }
    .ic { font-size:26px; }
    .stat b { font-size:28px; font-weight:700; margin-top:6px; }
    .stat span:last-child { font-size:13px; color:var(--muted); }
  `],
})
export class DashboardComponent implements OnInit {
  s = signal<any | null>(null);
  constructor(private admin: AdminService) {}
  ngOnInit() { this.admin.stats().subscribe((d: any) => this.s.set(d)); }
}
