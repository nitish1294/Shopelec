import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page-head">
      <div class="container">
        <div class="eyebrow" style="color:#ffd6d6">♥ Our story</div>
        <h1 style="color:#fff">Trusted electronics &amp; repair, since 2011</h1>
        <p style="color:#ffe3e3">What began as a small repair counter in Andheri has grown into a full electronics store serving customers across India — with the same promise: honest advice, fair prices, and repairs done right.</p>
      </div>
    </section>

    <section class="section container">
      <div class="about-grid">
        <div>
          <div class="eyebrow">Who we are</div>
          <h2>A store built on service, not just sales</h2>
          <p class="body">VoltEdge sells new and certified-refurbished laptops, desktops, printers, and accessories from brands people trust. But our heart is the service bench — over 5,000 devices repaired and returned to working life. Every repair carries a 90-day warranty and every refurbished machine a 6-month one.</p>
          <p class="body">Whether you walk into our Andheri store or order online from another city, you get the same care. We pack every device to survive the journey and stay reachable long after the sale.</p>
        </div>
        <div class="stats-card">
          <div class="stat"><b>14+</b><span>Years in business</span></div>
          <div class="stat"><b>5,000+</b><span>Devices repaired</span></div>
          <div class="stat"><b>10+</b><span>Brand partners</span></div>
          <div class="stat"><b>Pan-India</b><span>Courier reach</span></div>
        </div>
      </div>

      <div class="values">
        <div class="vcard"><span>🛡️</span><b>Honest advice</b><p>We recommend what fits your need and budget — not the priciest option.</p></div>
        <div class="vcard"><span>🛠️</span><b>Repairs done right</b><p>Certified technicians, genuine parts, and a warranty on every job.</p></div>
        <div class="vcard"><span>👥</span><b>Long-term relationships</b><p>Most of our business comes from repeat customers and referrals.</p></div>
      </div>

      <div class="eyebrow" style="margin-top:44px">✦ Credentials</div>
      <h2>Our certifications &amp; registrations</h2>
      <div class="certs">
        <div class="cert"><span>🏅</span><b>MSME Registered</b><small>Udyam-MH-19-0000000</small></div>
        <div class="cert"><span>🛡️</span><b>GST Compliant</b><small>27ABCDE1234F1Z5</small></div>
        <div class="cert"><span>🏅</span><b>ISO 9001:2015</b><small>Quality Management</small></div>
        <div class="cert"><span>🛠️</span><b>Authorised Service Partner</b><small>Dell · HP · Lenovo</small></div>
      </div>

      <div style="text-align:center;margin-top:44px">
        <a routerLink="/reach-us" class="btn-primary">Get in touch →</a>
      </div>
    </section>
  `,
  styles: [`
    .page-head { background:linear-gradient(160deg,var(--red-dark),#6f1616); padding:56px 0 48px; }
    h1 { font-size:clamp(28px,4.5vw,44px); font-weight:700; margin:0; }
    .page-head p { font-size:17px; max-width:600px; margin:16px 0 0; line-height:1.55; }
    .about-grid { display:grid; grid-template-columns:1.4fr 1fr; gap:34px; align-items:start; margin-bottom:40px; }
    .body { font-size:15.5px; color:#5a4143; line-height:1.7; margin:0 0 16px; }
    .stats-card { background:#fff; border:1px solid var(--border); border-radius:18px; padding:24px; display:grid; grid-template-columns:1fr 1fr; gap:18px; }
    .stat b { font-size:24px; font-weight:700; color:var(--red); display:block; }
    .stat span { font-size:12.5px; color:var(--muted); }
    .values { display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:18px; }
    .vcard { background:#fff; border:1px solid var(--border); border-radius:16px; padding:22px; }
    .vcard > span { font-size:26px; }
    .vcard b { display:block; margin:12px 0 6px; font-size:16.5px; }
    .vcard p { font-size:14px; color:var(--muted); margin:0; line-height:1.55; }
    .certs { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:16px; margin-top:8px; }
    .cert { background:#fff; border:1px solid var(--border); border-radius:16px; padding:22px 20px; text-align:center; }
    .cert > span { font-size:26px; }
    .cert b { display:block; margin:10px 0 4px; font-size:15.5px; }
    .cert small { font-size:12.5px; color:var(--muted); }
    @media (max-width:760px){ .about-grid { grid-template-columns:1fr; } }
  `],
})
export class AboutComponent {}
