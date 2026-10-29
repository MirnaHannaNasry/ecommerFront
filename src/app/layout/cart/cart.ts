import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { ToastService } from '../../core/services/toast.service';
import { ICartLine } from '../../core/models/cart.model';
import { enveronment } from '../../../environments/env';
import { getErrorMessage } from '../../core/utils/error.util';

@Component({
  imports: [CurrencyPipe,AsyncPipe,RouterLink],
  selector: 'app-cart',
  styleUrl: './cart.css',
  templateUrl: './cart.html',
})
export class Cart implements OnInit,OnDestroy{
  private _cartService = inject(CartService);
  private _authService = inject(AuthService);
  private _confirmService = inject(ConfirmService);
  private _toast = inject(ToastService);
  private _router = inject(Router);
  private _cdr = inject(ChangeDetectorRef);
  private _subscribtions = new Subscription();

  staticURL = enveronment.staticURL;
  loading$ = this._cartService.loading$;
  lines: ICartLine[] = [];
  total = 0;
  count = 0;
  canCheckout = false;
  hasPriceChanges = false;
  isLoggedin = false;

  ngOnInit(): void {
    const linesSub = this._cartService.lines$.subscribe(lines=>{
      this.lines = lines;
      // always calculated from the numbers: price x quantity
      this.total = CartService.getTotal(lines);
      this.count = lines.reduce((sum,l)=> sum + l.quantity, 0);
      this.canCheckout = CartService.canCheckout(lines);
      this.hasPriceChanges = lines.some(l=> l.priceChanged);
      this._cdr.markForCheck();
    });
    this._subscribtions.add(linesSub);

    const userSub = this._authService.getUserData().subscribe(user=>{
      this.isLoggedin = !!user;
      this._cdr.markForCheck();
    });
    this._subscribtions.add(userSub);
  }

  increase(line:ICartLine){
    this.changeQuantity(line, line.quantity + 1);
  }

  decrease(line:ICartLine){
    this.changeQuantity(line, line.quantity - 1);
  }

  private changeQuantity(line:ICartLine, quantity:number){
    this._cartService.setQuantity(line.productId, quantity).subscribe({
      error:(err)=> this._toast.show(getErrorMessage(err),'error')
    });
  }

  askRemove(line:ICartLine){
    this._confirmService.ask({
      title:'Remove this product?',
      message:'Are you sure you no longer want this product?',
      confirmText:'Remove Product',
      cancelText:'Keep Product',
      danger:true
    }).subscribe(confirmed=>{
      if(!confirmed){
        return;
      }
      this._cartService.remove(line.productId).subscribe({
        next:()=> this._toast.show(`"${line.name}" was removed from your cart`),
        error:(err)=> this._toast.show(getErrorMessage(err),'error')
      });
    });
  }

  acceptPrices(){
    this._cartService.acceptPriceChanges().subscribe({
      next:()=> this._toast.show('Prices updated'),
      error:(err)=> this._toast.show(getErrorMessage(err),'error')
    });
  }

  checkout(){
    if(this._authService.ifLogedinWithRole('user')){
      this._router.navigate(['/checkout']);
    }else{
      // guests log in first; the cart is kept and they come back to the checkout
      this._router.navigate(['/login'],{queryParams:{returnUrl:'/checkout'}});
    }
  }

  ngOnDestroy(): void {
    this._subscribtions.unsubscribe();
  }
}
