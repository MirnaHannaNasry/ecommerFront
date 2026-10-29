import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { IProduct } from '../../core/models/product.model';
import { Product } from '../productslist/product/product';

@Component({
  imports: [RouterLink,Product],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home implements OnInit{
  private _productService = inject(ProductService);
  private _cdr = inject(ChangeDetectorRef);
  products: IProduct[] = [];

  ngOnInit(): void {
    this._productService.getAllProducts({limit:4, sort:'createdAt', order:'desc'}).subscribe({
      next:(res)=>{
        this.products = res.data;
        this._cdr.markForCheck();
      },
      error:()=>{}
    })
  }
}
