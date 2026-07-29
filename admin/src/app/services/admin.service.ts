import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

const API = 'http://localhost:8000/api';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private _user = signal<any | null>(JSON.parse(localStorage.getItem('ve_admin_user') || 'null'));
  user = this._user.asReadonly();
  isLoggedIn = computed(() => this._user() !== null);

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    const body = new URLSearchParams();
    body.set('username', email); body.set('password', password);
    return this.http.post<any>(`${API}/auth/login`, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }).pipe(tap(res => {
      localStorage.setItem('ve_admin_token', res.access_token);
      localStorage.setItem('ve_admin_user', JSON.stringify(res.user));
      this._user.set(res.user);
    }));
  }
  logout() {
    localStorage.removeItem('ve_admin_token');
    localStorage.removeItem('ve_admin_user');
    this._user.set(null);
  }

  stats() { return this.http.get<any>(`${API}/admin/stats`); }
  products() { return this.http.get<any[]>(`${API}/admin/products`); }
  createProduct(p: any) { return this.http.post(`${API}/admin/products`, p); }
  updateProduct(id: number, p: any) { return this.http.put(`${API}/admin/products/${id}`, p); }
  deleteProduct(id: number) { return this.http.delete(`${API}/admin/products/${id}`); }
  importProducts(file: File) {
    const fd = new FormData(); fd.append('file', file);
    return this.http.post<any>(`${API}/admin/products/import`, fd);
  }
  orders() { return this.http.get<any[]>(`${API}/admin/orders`); }
  setOrderStatus(id: number, status: string) { return this.http.put(`${API}/admin/orders/${id}/status`, { status }); }
  users() { return this.http.get<any[]>(`${API}/admin/users`); }
  setUserRole(id: number, role: string) { return this.http.put(`${API}/admin/users/${id}/role`, { role }); }
  createAdmin(data: any) { return this.http.post(`${API}/admin/users`, data); }
}
