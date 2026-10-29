import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { OrderService } from '../../core/services/order.service';
import { ProductService } from '../../core/services/product.service';
import { UserService } from '../../core/services/user-service';
import { IOrder } from '../../core/models/order.model';
import { enveronment } from '../../../environments/env';
import { getErrorMessage } from '../../core/utils/error.util';

@Component({
  imports: [CurrencyPipe,DatePipe],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home implements OnInit{
  private _orderService = inject(OrderService);
  private _productService = inject(ProductService);
  private _userService = inject(UserService);
  private _cdr = inject(ChangeDetectorRef);

  staticURL = enveronment.staticURL;
  loading = true;
  errorMessage = '';
  revenue = 0;
  ordersCount = 0;
  productsCount = 0;
  usersCount = 0;
  byStatus: {_id:string; count:number}[] = [];
  monthly: any[] = [];
  topProducts: any[] = [];
  recentOrders: IOrder[] = [];

  ngOnInit(): void {
    this.load();
  }

  load(){
    this.loading = true;
    this.errorMessage = '';
    // real numbers from the backend (limit 1 -> we only need the "total" field)
    forkJoin({
      report: this._orderService.getSalesReport(),
      orders: this._orderService.getAllOrders({limit:5}),
      products: this._productService.getAllProducts({all:true, limit:1}),
      users: this._userService.getAllUsers({limit:1})
    }).subscribe({
      next:(r)=>{
        this.revenue = r.report.data?.overallStats?.[0]?.totalSalesAmount ?? 0;
        this.byStatus = r.report.data?.ordersByStatus ?? [];
        this.monthly = r.report.data?.monthlySales ?? [];
        this.topProducts = r.report.data?.topProducts ?? [];
        this.ordersCount = r.orders.total;
        this.recentOrders = r.orders.data;
        this.productsCount = r.products.total ?? 0;
        this.usersCount = r.users.total;
        this.loading = false;
        this._cdr.markForCheck();
      },
      error:(err)=>{
        this.errorMessage = getErrorMessage(err,'Could not load the dashboard');
        this.loading = false;
        this._cdr.markForCheck();
      }
    });
  }

  percent(value:number){
    const max = Math.max(...this.monthly.map(m=> m.totalRevenue), 1);
    return Math.max(2, (value / max) * 100);
  }
}
