import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-career',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page-head">
      <div class="container">
        <div class="eyebrow" style="color:#ffd6d6">💼 Careers</div>
        <h1 style="color:#fff">Build your career at VoltEdge</h1>
        <p style="color:#ffe3e3">We're a growing electronics and repair business in Mumbai. If you love technology and helping people, we'd love to hear from you.</p>
      </div>
    </section>

    <section class="section container">
      <div class="eyebrow">Open positions</div>
      <h2>Roles we're hiring for</h2>
      <div class="jobs">
        <div class="job" *ngFor="let j of jobs">
          <div>
            <div class="j-title">{{ j.title }}</div>
            <div class="j-meta">{{ j.type }} · {{ j.location }}</div>
            <p class="j-desc">{{ j.desc }}</p>
          </div>
          <button class="btn-ghost" (click)="apply(j.title)">Apply</button>
        </div>
      </div>

      <div class="apply-card" id="apply">
        <div class="eyebrow">Apply now</div>
        <h2>Send us your application</h2>
        <div class="ok" *ngIf="sent()">✓ Thanks! Your application has been received. We'll be in touch.</div>
        <div class="form-grid">
          <label>Full name<input [(ngModel)]="f.name" placeholder="Your name"></label>
          <label>Email<input [(ngModel)]="f.email" type="email" placeholder="you@email.com"></label>
          <label>Applying for<input [(ngModel)]="f.role" placeholder="Role"></label>
          <label>Phone<input [(ngModel)]="f.phone" placeholder="10-digit mobile"></label>
        </div>
        <label>Why you'd be a great fit<textarea [(ngModel)]="f.msg" style="min-height:100px" placeholder="Tell us about your experience"></textarea></label>
        <button class="btn-primary" [disabled]="!valid()" [style.opacity]="valid() ? 1 : .5" (click)="submit()">Submit application</button>
      </div>
    </section>
  `,
  styles: [`
    .page-head { background:linear-gradient(160deg,var(--red-dark),#6f1616); padding:56px 0 48px; }
    h1 { font-size:clamp(28px,4.5vw,44px); font-weight:700; margin:0; }
    .page-head p { font-size:17px; max-width:600px; margin:16px 0 0; line-height:1.55; }
    .jobs { display:flex; flex-direction:column; gap:14px; margin-bottom:44px; }
    .job { background:#fff; border:1px solid var(--border); border-radius:16px; padding:22px; display:flex; justify-content:space-between; align-items:center; gap:20px; }
    .j-title { font-size:17px; font-weight:600; }
    .j-meta { font-size:13px; color:var(--red); font-weight:600; margin:3px 0 8px; }
    .j-desc { font-size:14px; color:var(--muted); margin:0; line-height:1.5; max-width:640px; }
    .apply-card { background:#fff; border:1px solid var(--border); border-radius:20px; padding:32px; }
    .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:0 18px; }
    .ok { background:#e9f7ef; color:#276749; border:1px solid #b7e4c7; padding:11px 14px; border-radius:10px; font-size:14px; margin-bottom:16px; }
    @media (max-width:640px){ .form-grid { grid-template-columns:1fr; } .job { flex-direction:column; align-items:flex-start; } }
  `],
})
export class CareerComponent {
  jobs = [
    { title: 'Laptop & Desktop Repair Technician', type: 'Full-time', location: 'Andheri West, Mumbai', desc: 'Diagnose and repair laptops, desktops and printers at board level. 2+ years experience preferred.' },
    { title: 'Retail Sales Associate', type: 'Full-time', location: 'Andheri West, Mumbai', desc: 'Help customers pick the right device, handle billing, and manage in-store stock.' },
    { title: 'E-commerce & Dispatch Executive', type: 'Full-time', location: 'Andheri West, Mumbai', desc: 'Manage online orders, packing, and pan-India courier dispatch with tracking.' },
    { title: 'Field Service Engineer', type: 'Full-time', location: 'Mumbai (on-site visits)', desc: 'Visit customers for on-site repairs, installations and AMC support.' },
  ];
  f = { name: '', email: '', role: '', phone: '', msg: '' };
  sent = signal(false);
  valid() { return this.f.name.trim() && this.f.email.includes('@') && this.f.role.trim(); }
  apply(role: string) {
    this.f.role = role;
    document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' });
  }
  submit() {
    if (!this.valid()) return;
    this.sent.set(true);
    this.f = { name: '', email: '', role: '', phone: '', msg: '' };
  }
}
