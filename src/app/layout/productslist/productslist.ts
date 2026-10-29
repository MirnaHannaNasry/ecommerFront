import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { IProduct, ICategory } from '../../core/models/product.model';
import { Product } from './product/product';
import { Pagination } from '../../shared/pagination/pagination';
import { Subscription } from 'rxjs';
import { getErrorMessage } from '../../core/utils/error.util';

@Component({
  imports: [Product,Pagination],
  selector: 'app-productslist',
  styleUrl: './productslist.css',
  templateUrl: './productslist.html',
})
export class Productslist implements OnInit,OnDestroy{
  
  

  private _productService= inject(ProductService);
  private _categoryService = inject(CategoryService);
  private _cdr=inject(ChangeDetectorRef);
products:IProduct[] = [];
categories:ICategory[] = [];

loading = true;
errorMessage = '';
page = 1;
totalPages = 1;
search = '';
category = '';
sort = 'createdAt:desc';
inStock = false;
private _searchTimer:any;

private _subscribtions = new Subscription();

ngOnInit(): void {
  const catSub = this._categoryService.getAllCategories().subscribe({
    next:(res)=>{
      this.categories = res.data.categories.filter(c=> c.isActive !== false);
      this._cdr.markForCheck();
    },
    error:()=>{}
  });
  this._subscribtions.add(catSub);

  this.loadProducts();
  }

  loadProducts(){
    this.loading = true;
    this.errorMessage = '';
    const [sort, order] = this.sort.split(':');

    const getProducts =  this._productService.getAllProducts({
      page:this.page, limit:12, search:this.search.trim(), category:this.category,
      inStock:this.inStock || undefined, sort, order
    }).subscribe({
    next:(res)=>{
this.products = res.data;
this.totalPages = res.totalPages || 1;
this.loading = false;
this._cdr.markForCheck();
    },
    error:(error)=>{
this.errorMessage = getErrorMessage(error,'Could not load products');
this.loading = false;
this._cdr.markForCheck();
    }
   })

this._subscribtions.add(getProducts);
  }

  onSearch(value:string){
    this.search = value;
    clearTimeout(this._searchTimer);
    this._searchTimer = setTimeout(()=>{ this.page = 1; this.loadProducts(); }, 350);
  }

  onCategory(slug:string){
    this.category = slug;
    this.page = 1;
    this.loadProducts();
  }

  onSort(value:string){
    this.sort = value;
    this.page = 1;
    this.loadProducts();
  }

  onInStock(checked:boolean){
    this.inStock = checked;
    this.page = 1;
    this.loadProducts();
  }

  onPage(p:number){
    this.page = p;
    this.loadProducts();
    window.scrollTo({top:0,behavior:'smooth'});
  }


  ngOnDestroy(): void {
   this._subscribtions.unsubscribe();
   clearTimeout(this._searchTimer);
  }


}
