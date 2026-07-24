import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="section container">
      <div class="eyebrow">My account</div>
      <h2>Your orders</h2>
      <div class="ok" *ngIf="justPlaced()">✓ Order placed successfully! We'll call to confirm delivery.</div>

      <div class="orders" *ngIf="orders().length > 0; else none">
        <div class="order" *ngFor="let o of orders()">
          <div class="o-head">
            <div><b>Order #{{ o.id }}</b><span class="date">{{ o.created_at | date:'medium' }}</span></div>
            <span class="status">{{ o.status }}</span>
          </div>
          <div class="o-items">
            <div class="o-item" *ngFor="let it of o.items">
              <span>{{ it.name }} × {{ it.qty }}</span>
              <span>₹{{ it.price * it.qty | number }}</span>
            </div>
          </div>
          <div class="o-foot"><span>Delivered to: {{ o.address || '—' }}</span><b>Total ₹{{ o.total | number }}</b></div>
        </div>
      </div>

      <ng-template #none>
        <div class="empty">
          <p>You haven't placed any orders yet.</p>
          <a routerLink="/shop" class="btn-primary">Start shopping</a>
        </div>
      </ng-template>
    </section>
  `,
  styles: [`
    .ok { background:#e9f7ef; color:#276749; border:1px solid #b7e4c7; padding:11px 14px; border-radius:10px; font-size:14px; margin-bottom:20px; }
    .orders { display:flex; flex-direction:column; gap:14px; }
    .order { background:#fff; border:1px solid var(--border); border-radius:16px; padding:20px; }
    .o-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; }
    .o-head .date { display:block; font-size:12.5px; color:var(--muted); }
    .status { background:var(--red-soft); color:var(--red-dark); font-size:12px; font-weight:700; padding:5px 12px; border-radius:999px; text-transform:capitalize; }
    .o-items { display:flex; flex-direction:column; gap:7px; padding:12px 0; border-top:1px solid var(--border); border-bottom:1px solid var(--border); }
    .o-item { display:flex; justify-content:space-between; font-size:14px; color:#5a4143; }
    .o-foot { display:flex; justify-content:space-between; align-items:center; margin-top:12px; font-size:14px; }
    .empty { text-align:center; padding:60px 0; color:var(--muted); display:flex; flex-direction:column; align-items:center; gap:16px; }
  `],
})
export class OrdersComponent implements OnInit {
  orders = signal<any[]>([]);
  justPlaced = signal(false);
  constructor(private api: ApiService, private route: ActivatedRoute) {}
  ngOnInit() {
    this.justPlaced.set(this.route.snapshot.queryParamMap.get('placed') === '1');
    this.api.myOrders().subscribe(o => this.orders.set(o));
  }
}
