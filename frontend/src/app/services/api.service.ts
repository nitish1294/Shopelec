import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/models';

const API = 'http://localhost:8000/api';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  getProducts(cat?: string, q?: string, isNew?: boolean): Observable<Product[]> {
    let params = new HttpParams();
    if (cat && cat !== 'All') params = params.set('cat', cat);
    if (q) params = params.set('q', q);
    if (isNew !== undefined) params = params.set('is_new', String(isNew));
    return this.http.get<Product[]>(`${API}/products`, { params });
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${API}/products/categories`);
  }

  placeOrder(items: { product_id: number; name: string; price: number; qty: number }[], address: string): Observable<any> {
    return this.http.post(`${API}/orders`, { items, address });
  }

  myOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${API}/orders`);
  }
}
