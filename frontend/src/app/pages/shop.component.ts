import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { CartService } from '../services/cart.service';
import { AuthService } from '../services/auth.service';
import { Product } from '../models/models';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="section container">
      <div class="eyebrow">Shop the store</div>
      <h2>All products</h2>

      <div class="controls">
        <input [(ngModel)]="q" (ngModelChange)="reload()" placeholder="Search laptops, boAt, Fingers, SSDs…" class="search">
        <div class="chips">
          <button *ngFor="let c of cats()" (click)="selectCat(c)" [class.active]="c === cat()">{{ c }}</button>
        </div>
      </div>

      <div class="grid products">
        <div class="card" *ngFor="let p of products()">
          <div class="thumb">
            💻
            <span class="off" *ngIf="discount(p) > 0">{{ discount(p) }}% OFF</span>
            <span class="refurb" *ngIf="p.cat === 'Refurbished'">REFURB</span>
            <span class="brand" *ngIf="p.brand">{{ p.brand }}</span>
          </div>
          <div class="cat">{{ p.cat }}</div>
          <div class="p-name">{{ p.name }}</div>
          <div class="p-tag">{{ p.tag }}</div>
          <div class="p-meta">
            <span>★ {{ p.rating }}</span>
            <span [style.color]="p.stock < 6 ? '#d64545' : '#3f8f5f'">{{ p.stock < 6 ? 'Only ' + p.stock + ' left' : 'In stock' }}</span>
          </div>
          <div class="p-foot">
            <div><span class="price">₹{{ p.price | number }}</span> <span class="mrp" *ngIf="discount(p) > 0">₹{{ p.mrp | number }}</span></div>
            <button class="btn-primary sm" (click)="addToCart(p)">Add</button>
          </div>
        </div>
        <div class="empty" *ngIf="products().length === 0">No products match. Try another term or clear the filter.</div>
      </div>

      <!-- Flipkart-style prompt: appears when a guest starts shopping -->
      <div class="login-gate" *ngIf="showGate()" (click)="showGate.set(false)">
        <div class="gate-card" (click)="$event.stopPropagation()">
          <button class="gate-close" (click)="showGate.set(false)">✕</button>
          <div class="gate-left">
            <h3>Login</h3>
            <p>Get access to your orders, wishlist, and faster checkout.</p>
          </div>
          <div class="gate-right">
            <p class="gate-msg">You've started shopping! Log in or create an account to save your cart and check out.</p>
            <button class="btn-primary" style="width:100%" (click)="goLogin()">Login to continue</button>
            <button class="btn-ghost" style="width:100%;margin-top:10px" (click)="goSignup()">New here? Sign up</button>
            <button class="skip" (click)="showGate.set(false)">Continue browsing as guest</button>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .controls { display:flex; flex-direction:column; gap:14px; margin-bottom:24px; }
    .search { max-width:520px; background:var(--red-soft); border:1px solid #f6d5d5; }
    .chips { display:flex; gap:9px; flex-wrap:wrap; }
    .chips button { border:1px solid #f2c9c9; background:#fff; color:#8a6668; padding:8px 16px; border-radius:999px; font-size:14px; font-weight:600; }
    .chips button.active { background:var(--red); color:#fff; border-color:var(--red); }
    .products { grid-template-columns:repeat(auto-fill,minmax(230px,1fr)); }
    .thumb { height:120px; border-radius:12px; background:linear-gradient(135deg,#ffe0e0,#fff); display:grid; place-items:center; font-size:44px; margin-bottom:13px; position:relative; }
    .off { position:absolute; top:9px; left:9px; background:var(--red); color:#fff; font-size:11px; font-weight:700; padding:3px 8px; border-radius:6px; }
    .refurb { position:absolute; top:9px; right:9px; background:var(--ink); color:#fff; font-size:10px; font-weight:700; padding:3px 8px; border-radius:6px; }
    .brand { position:absolute; bottom:9px; right:9px; background:#fff; color:var(--red-dark); font-size:10px; font-weight:700; padding:3px 8px; border-radius:6px; border:1px solid #f2c9c9; }
    .cat { font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#b58e90; font-weight:600; }
    .p-name { font-weight:600; font-size:15.5px; margin:3px 0; }
    .p-tag { font-size:12.5px; color:var(--muted); margin-bottom:9px; }
    .p-meta { display:flex; justify-content:space-between; font-size:12.5px; font-weight:600; color:#6f5052; margin-bottom:11px; }
    .p-foot { display:flex; justify-content:space-between; align-items:center; gap:8px; }
    .price { font-size:18px; font-weight:700; }
    .mrp { font-size:13px; color:#b58e90; text-decoration:line-through; }
    .btn-primary.sm { padding:8px 16px; font-size:14px; border-radius:10px; }
    .empty { grid-column:1/-1; text-align:center; padding:40px; color:#b58e90; }
    .login-gate { position:fixed; inset:0; background:rgba(40,12,14,.55); backdrop-filter:blur(3px); z-index:60; display:grid; place-items:center; padding:20px; }
    .gate-card { display:flex; background:#fff; border-radius:16px; overflow:hidden; max-width:620px; width:100%; position:relative; box-shadow:0 20px 50px rgba(0,0,0,.3); }
    .gate-close { position:absolute; top:12px; right:14px; background:none; border:none; font-size:16px; color:#999; }
    .gate-left { background:linear-gradient(160deg,var(--red),var(--red-dark)); color:#fff; padding:36px 28px; width:230px; flex-shrink:0; }
    .gate-left h3 { font-size:26px; margin:0 0 12px; }
    .gate-left p { font-size:14px; color:#ffe0e0; line-height:1.5; }
    .gate-right { padding:32px 28px; flex:1; }
    .gate-msg { font-size:14.5px; color:#5a4143; margin:0 0 20px; line-height:1.5; }
    .skip { display:block; width:100%; background:none; border:none; color:var(--muted); font-size:13px; margin-top:14px; text-decoration:underline; }
    @media (max-width:520px){ .gate-left { display:none; } }
  `],
})
export class ShopComponent implements OnInit {
  products = signal<Product[]>([]);
  cats = signal<string[]>(['All']);
  cat = signal('All');
  q = '';
  showGate = signal(false);
  private gateShown = false;

  constructor(private api: ApiService, public cart: CartService, private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.api.getCategories().subscribe(c => this.cats.set(c));
    this.reload();
  }
  reload() { this.api.getProducts(this.cat(), this.q).subscribe(p => this.products.set(p)); }
  selectCat(c: string) { this.cat.set(c); this.reload(); }
  discount(p: Product) { return p.mrp > p.price ? Math.round((1 - p.price / p.mrp) * 100) : 0; }

  addToCart(p: Product) {
    this.cart.add(p);
    // Flipkart-style: first time a guest adds to cart, prompt login
    if (!this.auth.isLoggedIn() && !this.gateShown) {
      this.gateShown = true;
      this.showGate.set(true);
    }
  }
  goLogin() { this.router.navigate(['/login'], { queryParams: { redirect: '/shop' } }); }
  goSignup() { this.router.navigate(['/signup'], { queryParams: { redirect: '/shop' } }); }
}
