import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { ToastService } from '../../core/services/toast.service';
import { IOrder } from '../../core/models/order.model';
import { Pagination } from '../../shared/pagination/pagination';
import { getErrorMessage } from '../../core/utils/error.util';

@Component({
  imports: [CurrencyPipe,DatePipe,RouterLink,Pagination],
  selector: 'app-my-orders',
  styleUrl: './my-orders.css',
  templateUrl: './my-orders.html',
})
export class MyOrders implements OnInit{
  private _orderService = inject(OrderService);
  private _confirmService = inject(ConfirmService);
  private _toast = inject(ToastService);
  private _cdr = inject(ChangeDetectorRef);

  orders: IOrder[] = [];
  loading = true;
  errorMessage = '';
  page = 1;
  totalPages = 1;

  ngOnInit(): void {
    this.load(1);
  }

  load(page:number){
    this.loading = true;
    this._orderService.getMyOrders(page).subscribe({
      next:(res)=>{
        this.orders = res.data;
        this.page = res.page;
        this.totalPages = res.totalPages || 1;
        this.loading = false;
        this._cdr.markForCheck();
      },
      error:(err)=>{
        this.errorMessage = getErrorMessage(err);
        this.loading = false;
        this._cdr.markForCheck();
      }
    });
  }

  badge(status:string){
    if(status === 'delivered') return 'bg-success';
    if(['cancelled','rejected','refunded'].includes(status)) return 'bg-danger';
    if(status === 'pending') return 'bg-warning text-dark';
    return 'bg-primary';
  }

  cancel(order:IOrder){
    this._confirmService.ask({
      title:'Cancel this order?',
      message:'The items will go back to stock. This cannot be undone.',
      confirmText:'Cancel order',
      cancelText:'Keep order',
      danger:true
    }).subscribe(confirmed=>{
      if(!confirmed){
        return;
      }
      this._orderService.cancelOrder(order._id).subscribe({
        next:()=>{
          this._toast.show('Order cancelled');
          this.load(this.page);
        },
        error:(err)=> this._toast.show(getErrorMessage(err),'error')
      });
    });
  }
}
