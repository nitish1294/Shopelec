import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../services/admin.service';

const EMPTY = { name: '', cat: 'Laptops', price: 0, mrp: 0, rating: 0, tag: '', stock: 0, brand: '', is_new: false };

@Component({
  selector: 'admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="head">
      <div><h1>Products</h1><p class="sub">{{ products().length }} items in catalogue</p></div>
      <div class="actions">
        <label class="btn btn-ghost" style="display:inline-flex;align-items:center;gap:6px">
          ⬆ Bulk import
          <input type="file" accept=".csv,.xlsx,.xls" (change)="onFile($event)" hidden>
        </label>
        <button class="btn" (click)="openNew()">+ Add product</button>
      </div>
    </div>

    <div class="notice" *ngIf="importMsg()">{{ importMsg() }}</div>

    <div class="card" style="padding:0;overflow-x:auto">
      <table>
        <thead><tr><th>ID</th><th>Name</th><th>Category</th><th>Price</th><th>MRP</th><th>Stock</th><th>Brand</th><th>New</th><th></th></tr></thead>
        <tbody>
          <tr *ngFor="let p of products()">
            <td>{{ p.id }}</td><td>{{ p.name }}</td><td>{{ p.cat }}</td>
            <td>₹{{ p.price | number }}</td><td>₹{{ p.mrp | number }}</td>
            <td [style.color]="p.stock < 6 ? '#d62828' : 'inherit'">{{ p.stock }}</td>
            <td>{{ p.brand || '—' }}</td><td>{{ p.is_new ? '✓' : '' }}</td>
            <td class="row-actions">
              <button class="btn btn-ghost btn-sm" (click)="openEdit(p)">Edit</button>
              <button class="btn btn-ghost btn-sm" (click)="del(p)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="overlay" *ngIf="showForm()" (click)="showForm.set(false)">
      <div class="modal" (click)="$event.stopPropagation()">
        <h3>{{ editing() ? 'Edit product' : 'Add product' }}</h3>
        <div class="grid2">
          <label>Name<input [(ngModel)]="form.name"></label>
          <label>Category
            <select [(ngModel)]="form.cat">
              <option>Laptops</option><option>Desktops</option><option>Refurbished</option>
              <option>Printers</option><option>Accessories</option>
            </select>
          </label>
          <label>Price ₹<input type="number" [(ngModel)]="form.price"></label>
          <label>MRP ₹<input type="number" [(ngModel)]="form.mrp"></label>
          <label>Stock<input type="number" [(ngModel)]="form.stock"></label>
          <label>Rating<input type="number" step="0.1" [(ngModel)]="form.rating"></label>
          <label>Brand<input [(ngModel)]="form.brand" placeholder="e.g. boAt, Fingers"></label>
          <label>Tag<input [(ngModel)]="form.tag" placeholder="Core i5 · 16GB · 512GB"></label>
        </div>
        <label class="chk"><input type="checkbox" [(ngModel)]="form.is_new" style="width:auto"> Mark as new arrival</label>
        <div class="err" *ngIf="formErr()">{{ formErr() }}</div>
        <div class="modal-foot">
          <button class="btn btn-ghost" (click)="showForm.set(false)">Cancel</button>
          <button class="btn" (click)="save()">{{ editing() ? 'Save changes' : 'Add product' }}</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .head { display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:22px; gap:16px; flex-wrap:wrap; }
    h1 { font-size:26px; margin:0 0 4px; } .sub { color:var(--muted); margin:0; }
    .actions { display:flex; gap:10px; }
    .notice { background:#e9f7ef; color:#276749; border:1px solid #b7e4c7; padding:11px 14px; border-radius:10px; margin-bottom:16px; font-size:14px; }
    .row-actions { display:flex; gap:6px; }
    .overlay { position:fixed; inset:0; background:rgba(30,15,17,.5); display:grid; place-items:center; padding:20px; z-index:50; }
    .modal { background:#fff; border-radius:16px; padding:26px; width:100%; max-width:560px; max-height:90vh; overflow-y:auto; }
    .modal h3 { margin:0 0 18px; }
    .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:12px 14px; }
    label { font-size:13px; font-weight:600; display:flex; flex-direction:column; gap:5px; }
    .chk { flex-direction:row; align-items:center; gap:8px; margin-top:14px; }
    .err { background:var(--red-soft); color:var(--red-dark); padding:9px 12px; border-radius:8px; font-size:13px; margin-top:12px; }
    .modal-foot { display:flex; justify-content:flex-end; gap:10px; margin-top:20px; }
  `],
})
export class ProductsComponent implements OnInit {
  products = signal<any[]>([]);
  showForm = signal(false);
  editing = signal<number | null>(null);
  formErr = signal('');
  importMsg = signal('');
  form: any = { ...EMPTY };

  constructor(private admin: AdminService) {}
  ngOnInit() { this.load(); }
  load() { this.admin.products().subscribe((p: any[]) => this.products.set(p)); }

  openNew() { this.form = { ...EMPTY }; this.editing.set(null); this.formErr.set(''); this.showForm.set(true); }
  openEdit(p: any) { this.form = { ...p }; this.editing.set(p.id); this.formErr.set(''); this.showForm.set(true); }

  save() {
    if (!this.form.name || !this.form.cat || this.form.price <= 0) { this.formErr.set('Name, category and a valid price are required.'); return; }
    const payload = { ...this.form, brand: this.form.brand || null };
    const id = this.editing();
    const req = id ? this.admin.updateProduct(id, payload) : this.admin.createProduct(payload);
    req.subscribe({ next: () => { this.showForm.set(false); this.load(); }, error: (e: any) => this.formErr.set(e?.error?.detail || 'Save failed.') });
  }

  del(p: any) {
    if (!confirm(`Delete "${p.name}"?`)) return;
    this.admin.deleteProduct(p.id).subscribe(() => this.load());
  }

  onFile(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.importMsg.set('Uploading…');
    this.admin.importProducts(file).subscribe({
      next: (r: any) => { this.importMsg.set(`Imported ${r.inserted} products${r.skipped ? `, skipped ${r.skipped}` : ''}.`); this.load(); input.value = ''; },
      error: (e: any) => { this.importMsg.set(e?.error?.detail || 'Import failed.'); input.value = ''; },
    });
  }
}
