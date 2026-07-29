import { Component, computed } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { CartService } from './services/cart.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="offer-strip">
      <span class="marquee">🎉 FESTIVE SALE — up to 40% off refurbished laptops · 🚚 FREE pan-India courier above ₹4,999 · 🎧 boAt audio from ₹399 · 🛠️ Free repair diagnostics at our Andheri store</span>
    </div>

    <header class="nav">
      <a routerLink="/" class="logo"><span class="logo-mark">⚡</span> Volt<b>Edge</b></a>
      <nav class="nav-links">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Home</a>
        <a routerLink="/shop" routerLinkActive="active">Shop</a>
        <a routerLink="/about" routerLinkActive="active">About us</a>
        <a routerLink="/career" routerLinkActive="active">Career</a>
        <a routerLink="/reach-us" routerLinkActive="active">Reach us</a>
      </nav>
      <div class="nav-right">
        <button class="cart-btn btn-reset" (click)="cartOpen = true">🛒 <span>Cart</span>
          <span class="badge" *ngIf="cart.count() > 0">{{ cart.count() }}</span>
        </button>
        <ng-container *ngIf="auth.isLoggedIn(); else loginBtns">
          <a routerLink="/orders" class="link-plain">My orders</a>
          <button class="link-plain btn-reset" (click)="logout()">Logout ({{ auth.user()?.name }})</button>
        </ng-container>
        <ng-template #loginBtns>
          <a routerLink="/login" class="link-plain">Login</a>
          <a routerLink="/signup" class="btn-primary sm">Sign up</a>
        </ng-template>
      </div>
    </header>

    <main><router-outlet></router-outlet></main>

    <!-- Cart drawer -->
    <div class="cart-overlay" *ngIf="cartOpen" (click)="cartOpen = false">
      <div class="cart-drawer" (click)="$event.stopPropagation()">
        <div class="cart-head">
          <b>Your cart ({{ cart.count() }})</b>
          <button class="btn-reset x" (click)="cartOpen = false">✕</button>
        </div>
        <div class="cart-body">
          <div class="cart-empty" *ngIf="cart.items().length === 0">
            <div style="font-size:40px">🛒</div>
            <p>Your cart is empty.</p>
            <span>Add products to get started.</span>
          </div>
          <div class="cart-row" *ngFor="let i of cart.items()">
            <div class="cart-thumb">💻</div>
            <div style="flex:1;min-width:0">
              <div class="cart-name">{{ i.product.name }}</div>
              <div class="cart-price">₹{{ i.product.price | number }}</div>
            </div>
            <div class="qty">
              <button (click)="cart.dec(i.product.id)">−</button>
              <span>{{ i.qty }}</span>
              <button (click)="cart.inc(i.product.id)">+</button>
            </div>
            <button class="btn-reset remove" (click)="cart.remove(i.product.id)" title="Remove">✕</button>
          </div>
        </div>
        <div class="cart-foot" *ngIf="cart.items().length > 0">
          <div class="ship-note">🚚 {{ cart.total() >= 4999 ? "You've unlocked FREE pan-India courier!" : 'Add ₹' + (4999 - cart.total() | number) + ' more for free shipping' }}</div>
          <div class="cart-total"><span>Total</span><b>₹{{ cart.total() | number }}</b></div>
          <button class="btn-primary" style="width:100%" (click)="goCheckout()">
            {{ auth.isLoggedIn() ? 'Proceed to checkout' : 'Login to checkout' }}
          </button>
        </div>
      </div>
    </div>

    <footer class="footer">
      <div class="footer-top container">
        <div class="fcol brand">
          <div class="logo"><span class="logo-mark">⚡</span> <span style="color:#fff">Volt<b>Edge</b></span></div>
          <p>New &amp; refurbished electronics, expert repairs, and pan-India courier — from our Andheri West store since 2011.</p>
          <div class="socials"><span>f</span><span>in</span><span>X</span><span>▶</span></div>
        </div>
        <div class="fcol">
          <b>Shop</b>
          <a routerLink="/shop">Laptops</a><a routerLink="/shop">Desktops</a>
          <a routerLink="/shop">Refurbished</a><a routerLink="/shop">Accessories</a>
        </div>
        <div class="fcol">
          <b>Company</b>
          <a routerLink="/about">About us</a><a routerLink="/career">Career</a>
          <a routerLink="/reach-us">Reach us</a>
        </div>
        <div class="fcol">
          <b>Account</b>
          <a routerLink="/login">Login</a><a routerLink="/signup">Sign up</a>
          <a routerLink="/orders">My orders</a>
        </div>
        <div class="fcol">
          <b>Certifications</b>
          <span class="cert-pill">ISO 9001:2015</span>
          <span class="cert-pill">GST Compliant</span>
          <span class="cert-pill">MSME Registered</span>
        </div>
      </div>
      <div class="footer-bottom container">
        <span>© 2026 VoltEdge Electronics · Andheri West, Mumbai</span>
        <span>Privacy · Terms · Warranty</span>
      </div>
    </footer>
  `,
  styles: [`
    .offer-strip { background: linear-gradient(90deg,var(--red),var(--red-dark)); color:#fff; font-size:13px; font-weight:600; padding:8px 0; overflow:hidden; white-space:nowrap; }
    .marquee { display:inline-block; padding-left:100%; animation: scroll 26s linear infinite; }
    @keyframes scroll { to { transform: translateX(-100%); } }
    .nav { position:sticky; top:0; z-index:30; background:rgba(255,255,255,.92); backdrop-filter:blur(8px); border-bottom:1px solid var(--border); display:flex; align-items:center; gap:18px; padding:12px 24px; }
    .logo { font-size:21px; font-weight:500; display:flex; align-items:center; gap:9px; color:var(--ink); }
    .logo-mark { width:34px; height:34px; border-radius:9px; background:linear-gradient(135deg,var(--red),var(--red-dark)); color:#fff; display:grid; place-items:center; }
    .nav-links { display:flex; gap:4px; flex:1; justify-content:center; }
    .nav-links a { color:#5f4446; font-size:14.5px; font-weight:600; padding:8px 14px; border-radius:9px; }
    .nav-links a:hover { background:var(--red-soft); color:var(--red); }
    .nav-links a.active { color:var(--red); background:var(--red-soft); }
    .nav-right { display:flex; align-items:center; gap:12px; }
    .cart-btn { display:flex; align-items:center; gap:6px; background:var(--red); color:#fff; padding:9px 15px; border-radius:11px; font-size:14px; font-weight:600; position:relative; }
    .badge { position:absolute; top:-6px; right:-6px; background:var(--ink); color:#fff; font-size:11px; font-weight:700; min-width:19px; height:19px; border-radius:10px; display:grid; place-items:center; }
    .link-plain { color:#5f4446; font-size:14px; font-weight:600; }
    .btn-reset { background:none; border:none; }
    .btn-primary.sm { padding:8px 16px; font-size:14px; border-radius:10px; }
    .footer { background:var(--ink); color:#d9c9cb; margin-top:40px; }
    .footer-top { display:grid; grid-template-columns:1.6fr 1fr 1fr 1fr 1.2fr; gap:30px; padding:48px 24px 34px; }
    .fcol { display:flex; flex-direction:column; gap:9px; }
    .fcol b { color:#fff; font-size:14px; margin-bottom:4px; }
    .fcol a { color:#b39a9c; font-size:13.5px; }
    .fcol a:hover { color:#fff; }
    .fcol.brand p { font-size:13.5px; color:#a58e90; line-height:1.6; }
    .socials { display:flex; gap:9px; }
    .socials span { width:34px; height:34px; border-radius:9px; background:rgba(255,255,255,.08); display:grid; place-items:center; color:#fff; font-size:13px; }
    .cert-pill { background:rgba(255,255,255,.07); color:#e6d4d6; font-size:11.5px; font-weight:600; padding:5px 10px; border-radius:999px; width:fit-content; }
    .footer-bottom { border-top:1px solid rgba(255,255,255,.1); padding:18px 24px; display:flex; justify-content:space-between; flex-wrap:wrap; gap:10px; font-size:13px; color:#a58e90; }
    @media (max-width:900px){ .nav-links { display:none; } .footer-top { grid-template-columns:1fr 1fr; } }
    @media (max-width:520px){ .cart-btn span { display:none; } .footer-top { grid-template-columns:1fr; } }
    .cart-overlay { position:fixed; inset:0; background:rgba(40,12,14,.5); backdrop-filter:blur(3px); z-index:50; display:flex; justify-content:flex-end; }
    .cart-drawer { width:min(420px,100%); background:#fff; height:100%; display:flex; flex-direction:column; box-shadow:-8px 0 30px rgba(0,0,0,.2); }
    .cart-head { display:flex; justify-content:space-between; align-items:center; padding:18px 20px; border-bottom:1px solid var(--border); font-size:16px; }
    .cart-head .x { font-size:18px; color:#999; }
    .cart-body { flex:1; overflow-y:auto; padding:8px 20px; }
    .cart-empty { text-align:center; color:var(--muted); padding:60px 0; display:flex; flex-direction:column; align-items:center; gap:6px; }
    .cart-row { display:flex; align-items:center; gap:12px; padding:14px 0; border-bottom:1px solid #f9e8e8; }
    .cart-thumb { width:46px; height:46px; border-radius:10px; background:linear-gradient(135deg,#ffe0e0,#fff); display:grid; place-items:center; font-size:22px; flex-shrink:0; }
    .cart-name { font-weight:600; font-size:14px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .cart-price { color:var(--muted); font-size:13px; }
    .qty { display:flex; align-items:center; gap:8px; background:var(--red-soft); border-radius:9px; padding:4px 8px; }
    .qty button { border:none; background:#fff; border-radius:6px; width:24px; height:24px; box-shadow:0 1px 2px rgba(0,0,0,.08); }
    .qty span { min-width:18px; text-align:center; }
    .remove { color:#b0b6c4; font-size:15px; }
    .cart-foot { padding:18px 20px; border-top:1px solid var(--border); }
    .ship-note { display:flex; align-items:center; gap:7px; font-size:12.5px; color:var(--red-dark); background:var(--red-soft); padding:9px 12px; border-radius:9px; margin-bottom:12px; font-weight:600; }
    .cart-total { display:flex; justify-content:space-between; font-size:17px; margin-bottom:14px; }
  `],
})
export class AppComponent {
  cartOpen = false;
  constructor(public auth: AuthService, public cart: CartService, private router: Router) {}
  logout() { this.auth.logout(); this.router.navigate(['/']); }
  goCheckout() {
    this.cartOpen = false;
    if (this.auth.isLoggedIn()) this.router.navigate(['/checkout']);
    else this.router.navigate(['/login'], { queryParams: { redirect: '/checkout' } });
  }
}
