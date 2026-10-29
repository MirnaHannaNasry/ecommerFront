import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { IOrder } from '../../core/models/order.model';
import { getErrorMessage } from '../../core/utils/error.util';

@Component({
  imports: [CurrencyPipe,DatePipe,RouterLink],
  selector: 'app-order-success',
  styleUrl: './order-success.css',
  templateUrl: './order-success.html',
})
export class OrderSuccess implements OnInit{
  private _orderService = inject(OrderService);
  private _route = inject(ActivatedRoute);
  private _cdr = inject(ChangeDetectorRef);

  order: IOrder | null = null;
  errorMessage = '';

  ngOnInit(): void {
    const id = this._route.snapshot.paramMap.get('id');
    if(id){
      this._orderService.getOrder(id).subscribe({
        next:(res)=>{
          this.order = res.data;
          this._cdr.markForCheck();
        },
        error:(err)=>{
          this.errorMessage = getErrorMessage(err,'Could not load the order');
          this._cdr.markForCheck();
        }
      });
    }
  }
}
