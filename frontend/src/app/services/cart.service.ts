import { Injectable, signal, computed } from '@angular/core';
import { Product, CartItem } from '../models/models';

@Injectable({ providedIn: 'root' })
export class CartService {
  private _items = signal<CartItem[]>([]);
  items = this._items.asReadonly();
  count = computed(() => this._items().reduce((s, i) => s + i.qty, 0));
  total = computed(() => this._items().reduce((s, i) => s + i.product.price * i.qty, 0));

  add(product: Product) {
    const items = [...this._items()];
    const found = items.find(i => i.product.id === product.id);
    if (found) found.qty++;
    else items.push({ product, qty: 1 });
    this._items.set(items);
  }

  inc(id: number) {
    this._items.set(this._items().map(i => i.product.id === id ? { ...i, qty: i.qty + 1 } : i));
  }

  dec(id: number) {
    this._items.set(
      this._items()
        .map(i => i.product.id === id ? { ...i, qty: i.qty - 1 } : i)
        .filter(i => i.qty > 0)
    );
  }

  remove(id: number) {
    this._items.set(this._items().filter(i => i.product.id !== id));
  }

  clear() {
    this._items.set([]);
  }
}
