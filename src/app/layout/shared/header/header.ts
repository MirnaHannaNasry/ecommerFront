import { AsyncPipe } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  imports: [RouterLink,RouterLinkActive,AsyncPipe],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header implements OnInit,OnDestroy{
  

  private _authService= inject(AuthService);
  private _cartService = inject(CartService);
  private _router = inject(Router);
  private _cdr = inject(ChangeDetectorRef);
  private _subscribtions = new Subscription();

  userName='';
  role='';
  cartCount$ = this._cartService.count$;

  ngOnInit(): void {
    const userSub = this._authService.getUserData().subscribe({
      next:(data)=>{
        if(data){
          this.userName= data.name
          this.role = data.role
        }else{
          this.userName = ''
          this.role = ''
        }
        this._cdr.markForCheck();

      },
      error:(err)=>{

      }
    })
    this._subscribtions.add(userSub);
  }

  logout(){
    this._authService.logOut();
    this._router.navigate(['/home']);
  }

  ngOnDestroy(): void {
    this._subscribtions.unsubscribe();
  }

}
