import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../services/admin.service';

const STATUSES = ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'];

@Component({
  selector: 'admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1>Orders</h1>
    <p class="sub">{{ orders().length }} orders</p>
    <div class="card" style="padding:0;overflow-x:auto">
      <table>
        <thead><tr><th>ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Address</th><th>Date</th><th>Status</th></tr></thead>
        <tbody>
          <tr *ngFor="let o of orders()">
            <td>#{{ o.id }}</td>
            <td>{{ o.user_email || ('user ' + o.user_id) }}</td>
            <td><div *ngFor="let it of o.items" class="li">{{ it.name }} × {{ it.qty }}</div></td>
            <td>₹{{ o.total | number }}</td>
            <td class="addr">{{ o.address || '—' }}</td>
            <td>{{ o.created_at | date:'short' }}</td>
            <td>
              <select [ngModel]="o.status" (ngModelChange)="change(o, $event)" class="status-sel">
                <option *ngFor="let s of statuses" [value]="s">{{ s }}</option>
              </select>
            </td>
          </tr>
          <tr *ngIf="orders().length === 0"><td colspan="7" style="text-align:center;color:var(--muted);padding:40px">No orders yet.</td></tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    h1 { font-size:26px; margin:0 0 4px; } .sub { color:var(--muted); margin:0 0 22px; }
    .li { font-size:13px; } .addr { max-width:220px; font-size:13px; color:var(--muted); }
    .status-sel { width:auto; text-transform:capitalize; }
  `],
})
export class OrdersComponent implements OnInit {
  orders = signal<any[]>([]);
  statuses = STATUSES;
  constructor(private admin: AdminService) {}
  ngOnInit() { this.admin.orders().subscribe((o: any[]) => this.orders.set(o)); }
  change(o: any, status: string) { this.admin.setOrderStatus(o.id, status).subscribe(() => o.status = status); }
}
