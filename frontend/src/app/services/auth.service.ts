import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { TokenResponse, User } from '../models/models';

const API = 'http://localhost:8000/api';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = signal<User | null>(this.readUser());
  user = this._user.asReadonly();
  isLoggedIn = computed(() => this._user() !== null);

  constructor(private http: HttpClient) {}

  private readUser(): User | null {
    const raw = localStorage.getItem('ve_user');
    return raw ? JSON.parse(raw) : null;
  }

  get token(): string | null {
    return localStorage.getItem('ve_token');
  }

  private persist(res: TokenResponse) {
    localStorage.setItem('ve_token', res.access_token);
    localStorage.setItem('ve_user', JSON.stringify(res.user));
    this._user.set(res.user);
  }

  signup(name: string, email: string, phone: string, password: string): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${API}/auth/signup`, { name, email, phone, password })
      .pipe(tap(res => this.persist(res)));
  }

  login(email: string, password: string): Observable<TokenResponse> {
    // OAuth2 password flow expects form-encoded username/password
    const body = new URLSearchParams();
    body.set('username', email);
    body.set('password', password);
    return this.http.post<TokenResponse>(`${API}/auth/login`, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }).pipe(tap(res => this.persist(res)));
  }

  logout() {
    localStorage.removeItem('ve_token');
    localStorage.removeItem('ve_user');
    this._user.set(null);
  }
}
