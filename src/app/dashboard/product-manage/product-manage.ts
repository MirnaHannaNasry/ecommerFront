import { CurrencyPipe } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { ToastService } from '../../core/services/toast.service';
import { ICategory, IProduct } from '../../core/models/product.model';
import { Pagination } from '../../shared/pagination/pagination';
import { enveronment } from '../../../environments/env';
import { getErrorMessage } from '../../core/utils/error.util';

@Component({
  imports: [CurrencyPipe,ReactiveFormsModule,Pagination],
  selector: 'app-product-manage',
  styleUrl: './product-manage.css',
  templateUrl: './product-manage.html',
})
export class ProductManage implements OnInit{
  private _productService = inject(ProductService);
  private _categoryService = inject(CategoryService);
  private _confirmService = inject(ConfirmService);
  private _toast = inject(ToastService);
  private _cdr = inject(ChangeDetectorRef);

  staticURL = enveronment.staticURL;
  products: IProduct[] = [];
  categories: ICategory[] = [];
  loading = true;
  errorMessage = '';
  page = 1;
  totalPages = 1;

  formOpen = false;
  editing: IProduct | null = null;
  saving = false;
  preview = '';
  fileError = '';
  private _file: File | null = null;

  form = new FormGroup({
    name: new FormControl('',Validators.required),
    category: new FormControl('',Validators.required),
    price: new FormControl(0,[Validators.required, Validators.min(0)]),
    stock: new FormControl(0,[Validators.required, Validators.min(0)]),
    desc: new FormControl(''),
    isTrending: new FormControl(false),
    isActive: new FormControl(true)
  });

  ngOnInit(): void {
    this._categoryService.getAllCategories().subscribe({
      next:(res)=>{
        this.categories = res.data.categories;
        this._cdr.markForCheck();
      },
      error:()=>{}
    });
    this.load(1);
  }

  load(page:number){
    this.loading = true;
    // all:true -> the admin also sees hidden and deleted products
    this._productService.getAllProducts({all:true, page, limit:20}).subscribe({
      next:(res)=>{
        this.products = res.data;
        this.page = res.page ?? 1;
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

  categoryName(p:IProduct){
    return typeof p.category === 'object' ? p.category?.name : '';
  }

  openForm(p?:IProduct){
    this.editing = p ?? null;
    this._file = null;
    this.fileError = '';
    this.preview = p?.imgURL ? this.staticURL + p.imgURL : '';
    const categoryId = p && typeof p.category === 'object' ? p.category?._id ?? '' : (p?.category as string) ?? '';
    this.form.reset({
      name:p?.name ?? '', category:categoryId, price:p?.price ?? 0, stock:p?.stock ?? 0,
      desc:p?.desc ?? '', isTrending:p?.isTrending ?? false, isActive:p?.isActive ?? true
    });
    this.formOpen = true;
    window.scrollTo({top:0,behavior:'smooth'});
  }

  closeForm(){
    this.formOpen = false;
  }

  onFile(event:Event){
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.fileError = '';
    if(file){
      if(!/\.(png|jpe?g)$/i.test(file.name)){
        this.fileError = 'Only .png, .jpg or .jpeg images are allowed';
        this._file = null;
        return;
      }
      if(file.size > 2 * 1024 * 1024){
        this.fileError = 'The image must be 2 MB or smaller';
        this._file = null;
        return;
      }
      this.preview = URL.createObjectURL(file);   // show the image before uploading
    }
    this._file = file;
  }

  save(){
    this.form.markAllAsTouched();
    if(this.form.invalid){
      return;
    }
    if(!this.editing && !this._file){
      this.fileError = 'Please choose a product image';
      return;
    }
    if(this.fileError){
      return;
    }
    const v = this.form.value;
    // multipart form: the backend reads the image from the "img" field
    const body = new FormData();
    body.append('name', v.name as string);
    body.append('category', v.category as string);
    body.append('price', String(v.price));
    body.append('stock', String(v.stock));
    body.append('desc', v.desc || '');
    body.append('isTrending', String(!!v.isTrending));
    body.append('isActive', String(!!v.isActive));
    if(this._file){
      body.append('img', this._file);
    }

    this.saving = true;
    const request = this.editing
      ? this._productService.updateProduct(this.editing._id, body)
      : this._productService.addProduct(body);
    request.subscribe({
      next:()=>{
        this.saving = false;
        this._toast.show(this.editing ? 'Product updated' : 'Product created');
        this.closeForm();
        this.load(this.page);
      },
      error:(err)=>{
        this.saving = false;
        this._toast.show(getErrorMessage(err),'error');
        this._cdr.markForCheck();
      }
    });
  }

  remove(p:IProduct){
    this._confirmService.ask({
      title:'Delete product?',
      message:`"${p.name}" will be hidden from the shop. You can restore it later.`,
      confirmText:'Delete',
      danger:true
    }).subscribe(confirmed=>{
      if(!confirmed){
        return;
      }
      this._productService.deleteProduct(p._id).subscribe({
        next:()=>{
          this._toast.show('Product deleted');
          this.load(this.page);
        },
        error:(err)=> this._toast.show(getErrorMessage(err),'error')
      });
    });
  }

  restore(p:IProduct){
    this._productService.restoreProduct(p._id).subscribe({
      next:()=>{
        this._toast.show('Product restored');
        this.load(this.page);
      },
      error:(err)=> this._toast.show(getErrorMessage(err),'error')
    });
  }
}
