import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartService } from '../../core/services/cart.service';
import { UserService } from '../../core/services/user-service';
import { OrderService } from '../../core/services/order.service';
import { ToastService } from '../../core/services/toast.service';
import { ICartLine } from '../../core/models/cart.model';
import { IAddress } from '../../core/models/auth.model';
import { IUser } from '../../core/models/user.model';
import { enveronment } from '../../../environments/env';
import { getErrorMessage } from '../../core/utils/error.util';

@Component({
  imports: [CurrencyPipe,AsyncPipe,ReactiveFormsModule,RouterLink],
  selector: 'app-checkout',
  styleUrl: './checkout.css',
  templateUrl: './checkout.html',
})
export class Checkout implements OnInit,OnDestroy{
  private _cartService = inject(CartService);
  private _userService = inject(UserService);
  private _orderService = inject(OrderService);
  private _toast = inject(ToastService);
  private _router = inject(Router);
  private _cdr = inject(ChangeDetectorRef);
  private _subscribtions = new Subscription();

  staticURL = enveronment.staticURL;
  loading$ = this._cartService.loading$;
  lines: ICartLine[] = [];
  total = 0;
  canCheckout = false;

  user: IUser | null = null;
  addresses: IAddress[] = [];
  selectedAddress = '';
  showAddressForm = false;
  saving = false;
  placing = false;
  errorMessage = '';
  serverProblem = '';

  phoneForm = new FormGroup({
    phone: new FormControl('',[Validators.required, Validators.pattern(/^\+?\d{10,15}$/)])
  });

  addressForm = new FormGroup({
    label: new FormControl(''),
    governorate: new FormControl(''),
    city: new FormControl('',Validators.required),
    street: new FormControl('',Validators.required),
    notes: new FormControl('')
  });

  ngOnInit(): void {
    const linesSub = this._cartService.lines$.subscribe(lines=>{
      this.lines = lines;
      this.total = CartService.getTotal(lines);
      this.canCheckout = CartService.canCheckout(lines);
      this._cdr.markForCheck();
    });
    this._subscribtions.add(linesSub);

    this.loadUser();
    // stock and prices may have changed: ask the server again before the user pays
    this._cartService.reload().subscribe({ error:()=>{} });
  }

  get problem(){
    if(this.serverProblem){
      return this.serverProblem;
    }
    if(this.lines.some(l=> !l.available)){
      return 'Some products are no longer available.';
    }
    if(this.lines.some(l=> !l.enoughStock)){
      return 'Some products do not have enough stock.';
    }
    if(this.lines.some(l=> l.priceChanged)){
      return 'Some prices changed.';
    }
    return '';
  }

  get canPlace(){
    return this.canCheckout && !!this.user?.phone && !!this.selectedAddress && !this.placing && !this.serverProblem;
  }

  loadUser(){
    this._userService.getMe().subscribe({
      next:(res)=>{
        this.user = res.data;
        this.addresses = res.data.addresses ?? [];
        const keep = this.addresses.find(a=> a._id === this.selectedAddress);
        this.selectedAddress = (keep ?? this.addresses.find(a=> a.isDefault) ?? this.addresses[0])?._id ?? '';
        this._cdr.markForCheck();
      },
      error:(err)=>{
        this.errorMessage = getErrorMessage(err);
        this._cdr.markForCheck();
      }
    });
  }

  savePhone(){
    if(this.phoneForm.invalid){
      this.phoneForm.markAllAsTouched();
      return;
    }
    this.saving = true;
    this._userService.updateMe({phone:this.phoneForm.value.phone as string}).subscribe({
      next:()=>{
        this.saving = false;
        this._toast.show('Phone saved');
        this.loadUser();
      },
      error:(err)=>{
        this.saving = false;
        this._toast.show(getErrorMessage(err),'error');
        this._cdr.markForCheck();
      }
    });
  }

  saveAddress(){
    if(this.addressForm.invalid){
      this.addressForm.markAllAsTouched();
      return;
    }
    this.saving = true;
    const body = {...this.addressForm.value, isDefault: this.addresses.length === 0} as IAddress;
    this._userService.addAddress(body).subscribe({
      next:(res:any)=>{
        this.saving = false;
        const list:IAddress[] = res.data ?? [];
        this.addresses = list;
        this.selectedAddress = list[list.length - 1]?._id ?? this.selectedAddress;
        this.addressForm.reset();
        this.showAddressForm = false;
        this._toast.show('Address saved');
        this._cdr.markForCheck();
      },
      error:(err)=>{
        this.saving = false;
        this._toast.show(getErrorMessage(err),'error');
        this._cdr.markForCheck();
      }
    });
  }

  placeOrder(){
    this.placing = true;
    this.errorMessage = '';
    this.serverProblem = '';
    this._orderService.placeOrder(this.selectedAddress).subscribe({
      next:(res)=>{
        this.placing = false;
        // the backend emptied the cart because the order was really saved
        this._cartService.reload().subscribe({ error:()=>{} });
        this._router.navigate(['/order-success', res.data._id]);
      },
      error:(err)=>{
        this.placing = false;
        if(err?.status === 409 && err?.error?.details?.type){
          // prices changed / out of stock / unavailable: send the user to review the cart
          this.serverProblem = err.error.message;
          this._cartService.reload().subscribe({ error:()=>{} });
        }else{
          this.errorMessage = getErrorMessage(err,'We could not place your order. Please try again.');
        }
        this._cdr.markForCheck();
      }
    });
  }

  ngOnDestroy(): void {
    this._subscribtions.unsubscribe();
  }
}
