import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../services/api.service';
import { CartService } from '../services/cart.service';
import { Product } from '../models/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="hero">
      <div class="container">
        <div class="eyebrow-pill">✦ Sales · Service · Support — since 2011</div>
        <h1>New, refurbished &amp; repaired —<br>all your electronics in one place.</h1>
        <p class="lead">Laptops, desktops, printers, and accessories from Fingers, boAt and more. Expert repairs at our Andheri store, and doorstep courier across India.</p>
        <div class="hero-btns">
          <a routerLink="/shop" class="btn-primary">Shop the sale →</a>
          <a routerLink="/reach-us" class="btn-ghost">🛠️ Book a repair</a>
        </div>
        <div class="stats">
          <div><b>14+</b><span>years serving India</span></div>
          <div><b>5,000+</b><span>devices repaired</span></div>
          <div><b>Pan-India</b><span>courier delivery</span></div>
        </div>
      </div>
    </section>

    <div class="container value-strip">
      <div class="vitem"><span>🚚</span><div><b>Pan-India courier</b><span>Safely packed &amp; insured</span></div></div>
      <div class="vitem"><span>♻️</span><div><b>Certified refurbished</b><span>Tested · 6-month warranty</span></div></div>
      <div class="vitem"><span>🛡️</span><div><b>90-day service warranty</b><span>On all repairs</span></div></div>
      <div class="vitem"><span>⚡</span><div><b>Prepaid discount</b><span>Extra 5% off online</span></div></div>
    </div>

    <section class="section arrivals">
      <div class="container">
        <div class="eyebrow">✦ Just landed</div>
        <h2>New arrivals in stock</h2>
        <div class="grid products">
          <div class="card" *ngFor="let p of arrivals()">
            <div class="thumb">💻<span class="new-tag">NEW</span></div>
            <div class="p-name">{{ p.name }}</div>
            <div class="p-tag">{{ p.tag }}</div>
            <div class="p-foot">
              <div><span class="price">₹{{ p.price | number }}</span></div>
              <button class="btn-primary sm" (click)="cart.add(p)">Add</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container refurb-banner">
        <span class="rb-icon">♻️</span>
        <div style="flex:1;min-width:220px">
          <h2 style="margin:0 0 6px">Certified refurbished — big savings, real warranty</h2>
          <p style="color:var(--muted);margin:0;line-height:1.55">Every refurbished laptop and desktop is professionally tested, cleaned, and restored, then backed by a 6-month warranty. Up to 40% off.</p>
        </div>
        <a routerLink="/shop" class="btn-primary" style="background:var(--ink)">Shop refurbished</a>
      </div>
    </section>

    <section class="section partners">
      <div class="container">
        <div class="eyebrow" style="text-align:center">Trusted partners</div>
        <h2 style="text-align:center">Brands we sell &amp; service</h2>
        <div class="partner-logos">
          <span *ngFor="let b of partners">{{ b }}</span>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .hero { background: radial-gradient(1000px 460px at 82% -10%, #ffdada, transparent), linear-gradient(180deg,#fff,var(--red-soft)); padding:64px 0; }
    .eyebrow-pill { display:inline-block; background:#fff; border:1px solid #f6d5d5; color:var(--red-dark); font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; padding:6px 12px; border-radius:999px; margin-bottom:18px; }
    h1 { font-size:clamp(30px,5vw,52px); line-height:1.08; margin:0; font-weight:700; }
    .lead { font-size:17px; color:var(--muted); max-width:580px; margin:20px 0 30px; line-height:1.55; }
    .hero-btns { display:flex; gap:12px; flex-wrap:wrap; }
    .stats { display:flex; gap:38px; margin-top:44px; flex-wrap:wrap; }
    .stats b { display:block; font-size:26px; font-weight:700; color:var(--red); }
    .stats span { font-size:13px; color:var(--muted); }
    .value-strip { display:grid; grid-template-columns:repeat(auto-fit,minmax(210px,1fr)); gap:14px; padding-top:22px; padding-bottom:22px; }
    .vitem { display:flex; align-items:center; gap:12px; background:#fff; border:1px solid var(--border); border-radius:14px; padding:14px 16px; }
    .vitem > span { font-size:22px; }
    .vitem b { display:block; font-size:14px; }
    .vitem div span { font-size:12.5px; color:var(--muted); }
    .arrivals { background:#fff; border-top:1px solid var(--border); border-bottom:1px solid var(--border); }
    .products { grid-template-columns:repeat(auto-fill,minmax(210px,1fr)); }
    .thumb { height:110px; border-radius:12px; background:linear-gradient(135deg,#ffe0e0,#fff); display:grid; place-items:center; font-size:38px; margin-bottom:12px; position:relative; }
    .new-tag { position:absolute; top:9px; left:9px; background:var(--red); color:#fff; font-size:10px; font-weight:700; padding:3px 8px; border-radius:6px; }
    .p-name { font-weight:600; font-size:15.5px; margin:3px 0; }
    .p-tag { font-size:12.5px; color:var(--muted); margin-bottom:9px; }
    .p-foot { display:flex; justify-content:space-between; align-items:center; }
    .price { font-size:18px; font-weight:700; }
    .btn-primary.sm { padding:8px 16px; font-size:14px; border-radius:10px; }
    .refurb-banner { background:linear-gradient(120deg,var(--red-soft),#fff); border:1px solid var(--border); border-radius:20px; padding:28px; display:flex; align-items:center; gap:24px; flex-wrap:wrap; }
    .rb-icon { width:58px; height:58px; border-radius:14px; background:var(--red); display:grid; place-items:center; font-size:26px; }
    .partners { background:#fff; border-top:1px solid var(--border); }
    .partner-logos { display:flex; flex-wrap:wrap; gap:14px; justify-content:center; margin-top:8px; }
    .partner-logos span { background:var(--red-soft); color:var(--red-dark); border:1px solid var(--border); border-radius:12px; padding:12px 22px; font-weight:700; font-size:16px; }
  `],
})
export class HomeComponent implements OnInit {
  arrivals = signal<Product[]>([]);
  partners = ['Dell', 'HP', 'Lenovo', 'Apple', 'Canon', 'Samsung', 'boAt', 'Fingers', 'Logitech', 'Acer'];
  constructor(private api: ApiService, public cart: CartService) {}
  ngOnInit() {
    this.api.getProducts(undefined, undefined, true).subscribe(ps => this.arrivals.set(ps.slice(0, 6)));
  }
}
