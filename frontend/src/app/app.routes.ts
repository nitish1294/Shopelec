import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home.component').then(m => m.HomeComponent) },
  { path: 'shop', loadComponent: () => import('./pages/shop.component').then(m => m.ShopComponent) },
  { path: 'about', loadComponent: () => import('./pages/about.component').then(m => m.AboutComponent) },
  { path: 'career', loadComponent: () => import('./pages/career.component').then(m => m.CareerComponent) },
  { path: 'reach-us', loadComponent: () => import('./pages/reach-us.component').then(m => m.ReachUsComponent) },
  { path: 'login', loadComponent: () => import('./pages/login.component').then(m => m.LoginComponent) },
  { path: 'signup', loadComponent: () => import('./pages/signup.component').then(m => m.SignupComponent) },
  { path: 'checkout', canActivate: [authGuard], loadComponent: () => import('./pages/checkout.component').then(m => m.CheckoutComponent) },
  { path: 'orders', canActivate: [authGuard], loadComponent: () => import('./pages/orders.component').then(m => m.OrdersComponent) },
  { path: '**', redirectTo: '' },
];
