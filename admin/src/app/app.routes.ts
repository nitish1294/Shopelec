import { Routes } from '@angular/router';
import { adminGuard } from './services/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login.component').then(m => m.LoginComponent) },
  { path: '', canActivate: [adminGuard], loadComponent: () => import('./pages/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'products', canActivate: [adminGuard], loadComponent: () => import('./pages/products.component').then(m => m.ProductsComponent) },
  { path: 'orders', canActivate: [adminGuard], loadComponent: () => import('./pages/orders.component').then(m => m.OrdersComponent) },
  { path: 'users', canActivate: [adminGuard], loadComponent: () => import('./pages/users.component').then(m => m.UsersComponent) },
  { path: '**', redirectTo: '' },
];
