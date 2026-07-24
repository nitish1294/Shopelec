export interface Product {
  id: number;
  slug: string;
  name: string;
  cat: string;
  price: number;
  mrp: number;
  rating: number;
  tag: string;
  stock: number;
  brand?: string | null;
  is_new: boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface CartItem {
  product: Product;
  qty: number;
}
