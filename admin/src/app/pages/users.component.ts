import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../services/admin.service';

const EMPTY = { name: '', email: '', phone: '', password: '', role: 'admin' };

@Component({
  selector: 'admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="head">
      <div><h1>Users</h1><p class="sub">{{ users().length }} registered users</p></div>
      <button class="btn" (click)="openNew()">+ Create admin</button>
    </div>

    <div class="notice" *ngIf="msg()">{{ msg() }}</div>

    <div class="card" style="padding:0;overflow-x:auto">
      <table>
        <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th><th></th></tr></thead>
        <tbody>
          <tr *ngFor="let u of users()">
            <td>{{ u.id }}</td><td>{{ u.name }}</td><td>{{ u.email }}</td><td>{{ u.phone || '—' }}</td>
            <td><span class="role" [class.admin]="u.role !== 'customer'">{{ u.role }}</span></td>
            <td>{{ u.created_at | date:'mediumDate' }}</td>
            <td>
              <button *ngIf="u.role === 'customer'" class="btn btn-ghost btn-sm" (click)="setRole(u, 'admin')">Make admin</button>
              <button *ngIf="u.role === 'admin'" class="btn btn-ghost btn-sm" (click)="setRole(u, 'customer')">Revoke admin</button>
              <span *ngIf="u.role === 'superadmin'" class="muted">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="overlay" *ngIf="showForm()" (click)="showForm.set(false)">
      <div class="modal" (click)="$event.stopPropagation()">
        <h3>Create admin account</h3>
        <p class="hint">Creates a new account with admin access. Super admins can also create other super admins.</p>
        <label>Full name<input [(ngModel)]="form.name" placeholder="Name"></label>
        <label>Email<input [(ngModel)]="form.email" type="email" placeholder="admin@example.com"></label>
        <label>Phone<input [(ngModel)]="form.phone" placeholder="Optional"></label>
        <label>Password<input [(ngModel)]="form.password" type="password" placeholder="Min 6 characters"></label>
        <label>Role
          <select [(ngModel)]="form.role">
            <option value="admin">Admin</option>
            <option value="superadmin" *ngIf="isSuper()">Super admin</option>
          </select>
        </label>
        <div class="err" *ngIf="formErr()">{{ formErr() }}</div>
        <div class="modal-foot">
          <button class="btn btn-ghost" (click)="showForm.set(false)">Cancel</button>
          <button class="btn" (click)="create()">Create account</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .head { display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:22px; gap:16px; flex-wrap:wrap; }
    h1 { font-size:26px; margin:0 0 4px; } .sub { color:var(--muted); margin:0; }
    .notice { background:#e9f7ef; color:#276749; border:1px solid #b7e4c7; padding:11px 14px; border-radius:10px; margin-bottom:16px; font-size:14px; }
    .role { font-size:12px; font-weight:600; padding:3px 10px; border-radius:999px; background:#eef0f4; text-transform:capitalize; }
    .role.admin { background:var(--red-soft); color:var(--red-dark); }
    .muted { color:var(--muted); }
    .overlay { position:fixed; inset:0; background:rgba(30,15,17,.5); display:grid; place-items:center; padding:20px; z-index:50; }
    .modal { background:#fff; border-radius:16px; padding:26px; width:100%; max-width:440px; }
    .modal h3 { margin:0 0 6px; }
    .hint { font-size:12.5px; color:var(--muted); margin:0 0 16px; line-height:1.5; }
    label { font-size:13px; font-weight:600; display:flex; flex-direction:column; gap:5px; margin-bottom:12px; }
    .err { background:var(--red-soft); color:var(--red-dark); padding:9px 12px; border-radius:8px; font-size:13px; margin-top:4px; }
    .modal-foot { display:flex; justify-content:flex-end; gap:10px; margin-top:18px; }
  `],
})
export class UsersComponent implements OnInit {
  users = signal<any[]>([]);
  showForm = signal(false);
  formErr = signal('');
  msg = signal('');
  form: any = { ...EMPTY };

  constructor(private admin: AdminService) {}
  ngOnInit() { this.load(); }
  load() { this.admin.users().subscribe((u: any[]) => this.users.set(u)); }
  isSuper() { return this.admin.user()?.role === 'superadmin'; }

  setRole(u: any, role: string) { this.admin.setUserRole(u.id, role).subscribe(() => this.load()); }

  openNew() { this.form = { ...EMPTY }; this.formErr.set(''); this.showForm.set(true); }
  create() {
    if (!this.form.name || !this.form.email.includes('@') || this.form.password.length < 6) {
      this.formErr.set('Fill all fields; password must be at least 6 characters.'); return;
    }
    this.admin.createAdmin(this.form).subscribe({
      next: (r: any) => { this.showForm.set(false); this.msg.set(`Admin account created: ${r.email} (${r.role})`); this.load(); },
      error: (e: any) => this.formErr.set(e?.error?.detail || 'Could not create account.'),
    });
  }
}
