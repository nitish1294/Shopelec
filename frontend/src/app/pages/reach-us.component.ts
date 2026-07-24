import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reach-us',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="section container">
      <div class="eyebrow">✉ Reach us</div>
      <h2>We'd love to hear from you</h2>
      <div class="contact-grid">
        <div class="info">
          <div class="row"><span class="ic">📍</span><div><b>Store</b><p>Shop 7, Link Road, Andheri West, Mumbai 400053</p></div></div>
          <div class="row"><span class="ic">📞</span><div><b>Phone</b><p>+91 98200 00000</p></div></div>
          <div class="row"><span class="ic">✉️</span><div><b>Email</b><p>hello&#64;voltedge.in</p></div></div>
          <div class="row"><span class="ic">🕘</span><div><b>Hours</b><p>Mon–Sat · 10:30 AM – 8:00 PM</p></div></div>
          <div class="map">📍 Andheri West, Mumbai</div>
        </div>
        <div class="form">
          <div class="ok" *ngIf="sent()">✓ Message sent! We'll reply soon.</div>
          <label>Your name<input [(ngModel)]="f.name" placeholder="Full name"></label>
          <label>Email<input [(ngModel)]="f.email" type="email" placeholder="you@email.com"></label>
          <label>Message<textarea [(ngModel)]="f.msg" style="min-height:120px" placeholder="How can we help?"></textarea></label>
          <button class="btn-primary" style="width:100%" [disabled]="!valid()" [style.opacity]="valid() ? 1 : .5" (click)="submit()">Send message</button>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .contact-grid { display:grid; grid-template-columns:1fr 1.1fr; gap:28px; align-items:start; }
    .info { display:flex; flex-direction:column; gap:16px; }
    .row { display:flex; gap:13px; align-items:flex-start; }
    .ic { width:38px; height:38px; border-radius:10px; background:var(--red-soft); display:grid; place-items:center; flex-shrink:0; }
    .row b { font-size:14px; }
    .row p { margin:2px 0 0; font-size:13.5px; color:#6f5052; }
    .map { margin-top:6px; height:150px; border-radius:16px; background:linear-gradient(135deg,#ffe0e0,#fff); display:grid; place-items:center; color:var(--red); font-weight:600; font-size:14px; }
    .form { background:#fff; border:1px solid var(--border); border-radius:18px; padding:24px; }
    .ok { background:#e9f7ef; color:#276749; border:1px solid #b7e4c7; padding:11px 14px; border-radius:10px; font-size:14px; margin-bottom:16px; }
    @media (max-width:760px){ .contact-grid { grid-template-columns:1fr; } }
  `],
})
export class ReachUsComponent {
  f = { name: '', email: '', msg: '' };
  sent = signal(false);
  valid() { return this.f.name.trim() && this.f.email.includes('@') && this.f.msg.trim(); }
  submit() { if (!this.valid()) return; this.sent.set(true); this.f = { name: '', email: '', msg: '' }; }
}
