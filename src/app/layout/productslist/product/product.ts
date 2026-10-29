import { Component, inject, Input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { IProduct } from '../../../core/models/product.model';
import { enveronment } from '../../../../environments/env';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';
import { getErrorMessage } from '../../../core/utils/error.util';

@Component({
  imports: [RouterLink,CurrencyPipe],
  selector: 'app-product',
  styleUrl: './product.css',
  templateUrl: './product.html',
})
export class Product {
  @Input() myProduct!:IProduct;
  staticURL = enveronment.staticURL;

  private _cartService = inject(CartService);
  private _toast = inject(ToastService);

  addToCart(){
    this._cartService.add(this.myProduct, 1).subscribe({
      next:()=> this._toast.show(`"${this.myProduct.name}" added to cart`),
      error:(err)=> this._toast.show(getErrorMessage(err),'error')
    })
  }
}
