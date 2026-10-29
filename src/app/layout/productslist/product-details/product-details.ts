import { CurrencyPipe } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ProductService } from '../../../core/services/product.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IProduct } from '../../../core/models/product.model';
import { enveronment } from '../../../../environments/env';
import { Product } from '../product/product';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';
import { getErrorMessage } from '../../../core/utils/error.util';
import { Subscription } from 'rxjs';

@Component({
  imports: [Product,RouterLink,CurrencyPipe],
  selector: 'app-product-details',
  styleUrl: './product-details.css',
  templateUrl: './product-details.html',
})
export class ProductDetails implements OnInit,OnDestroy{
  private _productService = inject(ProductService);
  private _cdr = inject(ChangeDetectorRef);
  private _activatedRouter = inject(ActivatedRoute);
  private _cartService = inject(CartService);
  private _toast = inject(ToastService);

  myProduct!:IProduct;
staticURL = enveronment.staticURL;
relatedProducts: IProduct[] = [];
quantity = 1;
inCart = 0;
private _subscribtions = new Subscription();

  ngOnInit(): void {
    // the resolver loads the product from the backend before this page opens.
    // We listen to "data" (not the snapshot) so that clicking a related product reloads the page content.
    const dataSub = this._activatedRouter.data.subscribe(data=>{
      const productRes = data['productRes'];
      if(productRes?.data){
        this.myProduct = productRes.data;
        this.quantity = 1;
        this.relatedProducts = [];
        this._productService.getRelatedProducts(this.myProduct.slug).subscribe({
          next:(res)=>{
            this.relatedProducts = res.data;
            this._cdr.markForCheck();
          },
          error:()=>{}
        });
      }
      this._cdr.markForCheck();
    });
    this._subscribtions.add(dataSub);

    // how many of this product are already in the cart
    const cartSub = this._cartService.lines$.subscribe(lines=>{
      this.inCart = lines.find(l=> l.productId === this.myProduct?._id)?.quantity ?? 0;
      this._cdr.markForCheck();
    });
    this._subscribtions.add(cartSub);
  }

  get maxQuantity(){
    return Math.max(0, (this.myProduct?.stock ?? 0) - this.inCart);
  }

  get categoryName(){
    const c = this.myProduct?.category;
    return typeof c === 'object' ? c?.name : '';
  }

  increase(){
    if(this.quantity < this.maxQuantity){
      this.quantity++;
    }
  }

  decrease(){
    if(this.quantity > 1){
      this.quantity--;
    }
  }

  addToCart(){
    this._cartService.add(this.myProduct, this.quantity).subscribe({
      next:()=>{
        this._toast.show(`Added ${this.quantity} x "${this.myProduct.name}" to your cart`);
        this.quantity = 1;
        this._cdr.markForCheck();
      },
      error:(err)=> this._toast.show(getErrorMessage(err),'error')
    })
  }

  ngOnDestroy(): void {
    this._subscribtions.unsubscribe();
  }

}
