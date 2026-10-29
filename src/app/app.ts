import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from './shared/footer/footer';
import { AuthService } from './core/services/auth.service';
import { CartService } from './core/services/cart.service';
import { Toast } from './shared/toast/toast';
import { ConfirmModal } from './shared/confirm-modal/confirm-modal';

@Component({
  imports: [RouterOutlet,Footer,Toast,ConfirmModal],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App implements OnInit{
 
  protected readonly title = signal('myStore');
  private _authService = inject(AuthService);
  // created here so the cart is loaded / merged as soon as the app starts
  private _cartService = inject(CartService);

   ngOnInit(): void {
   this._authService.checkIfLogedin();
  }
}
