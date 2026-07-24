import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../services/cart.service';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="section container">
      <div class="eyebrow">Checkout</div>
      <h2>Review &amp; place your order</h2>

      <div class="co-grid" *ngIf="cart.count() > 0; else empty">
        <div class="items">
          <div class="item" *ngFor="let i of cart.items()">
            <div class="thumb">💻</div>
            <div style="flex:1">
              <div class="n">{{ i.product.name }}</div>
              <div class="t">{{ i.product.tag }}</div>
            </div>
            <div class="qty">
              <button (click)="cart.dec(i.product.id)">−</button>
              <span>{{ i.qty }}</span>
              <button (click)="cart.inc(i.product.id)">+</button>
            </div>
            <div class="line">₹{{ i.product.price * i.qty | number }}</div>
          </div>
        </div>
        <div class="summary">
          <h3>Order summary</h3>
          <div class="s-row"><span>Items ({{ cart.count() }})</span><span>₹{{ cart.total() | number }}</span></div>
          <div class="s-row"><span>Shipping</span><span>{{ cart.total() >= 4999 ? 'FREE' : '₹99' }}</span></div>
          <div class="s-total"><span>Total</span><b>₹{{ grandTotal() | number }}</b></div>
          <label style="margin-top:14px">Delivery address<textarea [(ngModel)]="address" style="min-height:80px" placeholder="Full address with pincode"></textarea></label>
          <div class="err" *ngIf="error()">{{ error() }}</div>
          <button class="btn-primary" style="width:100%" [disabled]="placing()" (click)="place()">
            {{ placing() ? 'Placing…' : 'Place order' }}
          </button>
          <p class="note">Signed in as {{ auth.user()?.name }} · {{ auth.user()?.email }}</p>
        </div>
      </div>

      <ng-template #empty>
        <div class="empty-cart">
          <p>Your cart is empty.</p>
          <button class="btn-primary" (click)="router.navigate(['/shop'])">Start shopping</button>
        </div>
      </ng-template>
    </section>
  `,
  styles: [`
    .co-grid { display:grid; grid-template-columns:1.6fr 1fr; gap:24px; align-items:start; }
    .items { display:flex; flex-direction:column; gap:12px; }
    .item { background:#fff; border:1px solid var(--border); border-radius:14px; padding:14px; display:flex; align-items:center; gap:14px; }
    .thumb { width:52px; height:52px; border-radius:10px; background:linear-gradient(135deg,#ffe0e0,#fff); display:grid; place-items:center; font-size:24px; }
    .n { font-weight:600; font-size:15px; }
    .t { font-size:12.5px; color:var(--muted); }
    .qty { display:flex; align-items:center; gap:8px; background:var(--red-soft); border-radius:9px; padding:4px 8px; }
    .qty button { border:none; background:#fff; border-radius:6px; width:24px; height:24px; }
    .line { font-weight:700; min-width:80px; text-align:right; }
    .summary { background:#fff; border:1px solid var(--border); border-radius:18px; padding:24px; position:sticky; top:80px; }
    .summary h3 { margin:0 0 16px; }
    .s-row { display:flex; justify-content:space-between; font-size:14.5px; color:#5a4143; margin-bottom:10px; }
    .s-total { display:flex; justify-content:space-between; font-size:18px; padding-top:12px; border-top:1px solid var(--border); }
    .note { font-size:12.5px; color:var(--muted); text-align:center; margin-top:12px; }
    .err { background:var(--red-soft); color:var(--red-dark); padding:9px 12px; border-radius:9px; font-size:13px; margin-bottom:12px; }
    .empty-cart { text-align:center; padding:60px 0; color:var(--muted); display:flex; flex-direction:column; align-items:center; gap:16px; }
    @media (max-width:760px){ .co-grid { grid-template-columns:1fr; } }
  `],
})
export class CheckoutComponent {
  address = '';
  placing = signal(false);
  error = signal('');
  constructor(public cart: CartService, private api: ApiService, public auth: AuthService, public router: Router) {}
  grandTotal() { return this.cart.total() + (this.cart.total() >= 4999 ? 0 : 99); }
  place() {
    if (!this.address.trim()) { this.error.set('Please enter a delivery address.'); return; }
    this.placing.set(true); this.error.set('');
    const items = this.cart.items().map(i => ({ product_id: i.product.id, name: i.product.name, price: i.product.price, qty: i.qty }));
    this.api.placeOrder(items, this.address).subscribe({
      next: () => { this.cart.clear(); this.router.navigate(['/orders'], { queryParams: { placed: 1 } }); },
      error: (e) => { this.error.set(e?.error?.detail || 'Could not place order.'); this.placing.set(false); },
    });
  }
}
