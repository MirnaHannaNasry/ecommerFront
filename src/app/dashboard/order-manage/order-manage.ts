import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { OrderService } from '../../core/services/order.service';
import { ToastService } from '../../core/services/toast.service';
import { IOrder, ORDER_STATUSES } from '../../core/models/order.model';
import { Pagination } from '../../shared/pagination/pagination';
import { getErrorMessage } from '../../core/utils/error.util';

@Component({
  imports: [CurrencyPipe,DatePipe,Pagination],
  selector: 'app-order-manage',
  styleUrl: './order-manage.css',
  templateUrl: './order-manage.html',
})
export class OrderManage implements OnInit{
  private _orderService = inject(OrderService);
  private _toast = inject(ToastService);
  private _cdr = inject(ChangeDetectorRef);

  statuses = ORDER_STATUSES;
  orders: IOrder[] = [];
  loading = true;
  errorMessage = '';
  page = 1;
  totalPages = 1;
  filter = '';
  openId = '';

  ngOnInit(): void {
    this.load(1);
  }

  load(page:number){
    this.loading = true;
    this._orderService.getAllOrders({page, limit:15, status:this.filter}).subscribe({
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

  onFilter(status:string){
    this.filter = status;
    this.load(1);
  }

  toggle(id:string){
    this.openId = this.openId === id ? '' : id;
  }

  changeStatus(order:IOrder, status:string, select:HTMLSelectElement){
    this._orderService.updateStatus(order._id, status).subscribe({
      next:(res)=>{
        order.status = res.data.status;
        this._toast.show(`Order marked as ${status}`);
        this._cdr.markForCheck();
      },
      error:(err)=>{
        select.value = order.status;   // put the old value back
        this._toast.show(getErrorMessage(err),'error');
      }
    });
  }
}
