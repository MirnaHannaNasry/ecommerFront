import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../core/services/category.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { ToastService } from '../../core/services/toast.service';
import { ICategory } from '../../core/models/product.model';
import { getErrorMessage } from '../../core/utils/error.util';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-category-manage',
  styleUrl: './category-manage.css',
  templateUrl: './category-manage.html',
})
export class CategoryManage implements OnInit{
  private _categoryService = inject(CategoryService);
  private _confirmService = inject(ConfirmService);
  private _toast = inject(ToastService);
  private _cdr = inject(ChangeDetectorRef);

  categories: ICategory[] = [];
  loading = true;
  saving = false;
  errorMessage = '';
  editing: ICategory | null = null;

  form = new FormGroup({
    name: new FormControl('',Validators.required),
    isActive: new FormControl(true)
  });

  ngOnInit(): void {
    this.load();
  }

  load(){
    this.loading = true;
    this._categoryService.getAllCategories().subscribe({
      next:(res)=>{
        this.categories = res.data.categories;
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

  edit(c:ICategory){
    this.editing = c;
    this.form.reset({name:c.name, isActive:c.isActive ?? true});
  }

  cancel(){
    this.editing = null;
    this.form.reset({name:'', isActive:true});
  }

  // the backend needs a slug: build one from the name
  private slugify(name:string){
    return name.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'') || 'cat-' + Date.now().toString(36);
  }

  save(){
    if(this.form.invalid){
      this.form.markAllAsTouched();
      return;
    }
    const name = this.form.value.name as string;
    const isActive = !!this.form.value.isActive;
    this.saving = true;
    const request = this.editing
      ? this._categoryService.updateCategory(this.editing._id, {name, isActive})
      : this._categoryService.addCategory({name, isActive, slug:this.slugify(name)});
    request.subscribe({
      next:()=>{
        this.saving = false;
        this._toast.show(this.editing ? 'Category updated' : 'Category added');
        this.cancel();
        this.load();
      },
      error:(err)=>{
        this.saving = false;
        this._toast.show(getErrorMessage(err),'error');
        this._cdr.markForCheck();
      }
    });
  }

  remove(c:ICategory){
    this._confirmService.ask({
      title:'Delete category?',
      message:`"${c.name}" and its products will disappear from the shop.`,
      confirmText:'Delete',
      danger:true
    }).subscribe(confirmed=>{
      if(!confirmed){
        return;
      }
      this._categoryService.deleteCategory(c._id).subscribe({
        next:()=>{
          this._toast.show('Category deleted');
          this.load();
        },
        error:(err)=> this._toast.show(getErrorMessage(err),'error')
      });
    });
  }
}
