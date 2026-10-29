import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageService } from '../../core/services/page.service';
import { ToastService } from '../../core/services/toast.service';
import { PageKey } from '../../core/models/page.model';
import { getErrorMessage } from '../../core/utils/error.util';

// the admin edits the three public pages: about, policy and contact
@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-page-manage',
  styleUrl: './page-manage.css',
  templateUrl: './page-manage.html',
})
export class PageManage implements OnInit{
  private _pageService = inject(PageService);
  private _toast = inject(ToastService);
  private _cdr = inject(ChangeDetectorRef);

  tabs: {key:PageKey; label:string}[] = [
    {key:'about', label:'About us'},
    {key:'policy', label:'Policy'},
    {key:'contact', label:'Contact'}
  ];
  current: PageKey = 'about';
  loading = true;
  saving = false;

  form = new FormGroup({
    title: new FormControl('',Validators.required),
    content: new FormControl(''),
    email: new FormControl(''),
    phone: new FormControl(''),
    whatsapp: new FormControl(''),
    address: new FormControl(''),
    facebook: new FormControl(''),
    instagram: new FormControl('')
  });

  ngOnInit(): void {
    this.open('about');
  }

  open(key:PageKey){
    this.current = key;
    this.loading = true;
    const defaultTitle = this.tabs.find(t=> t.key === key)!.label;
    this._pageService.getPage(key).subscribe({
      next:(res)=>{
        const p = res.data;
        this.form.reset({
          title:p.title, content:p.content,
          email:p.contact?.email ?? '', phone:p.contact?.phone ?? '', whatsapp:p.contact?.whatsapp ?? '',
          address:p.contact?.address ?? '', facebook:p.contact?.facebook ?? '', instagram:p.contact?.instagram ?? ''
        });
        this.loading = false;
        this._cdr.markForCheck();
      },
      error:()=>{
        // 404 = not written yet: start from an empty page
        this.form.reset({title:defaultTitle, content:'', email:'', phone:'', whatsapp:'', address:'', facebook:'', instagram:''});
        this.loading = false;
        this._cdr.markForCheck();
      }
    });
  }

  save(){
    if(this.form.invalid){
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.value;
    const body:any = {title:v.title, content:v.content ?? ''};
    if(this.current === 'contact'){
      body.contact = {
        email:v.email, phone:v.phone, whatsapp:v.whatsapp,
        address:v.address, facebook:v.facebook, instagram:v.instagram
      };
    }
    this.saving = true;
    this._pageService.savePage(this.current, body).subscribe({
      next:()=>{
        this.saving = false;
        this._toast.show('Page saved');
        this._cdr.markForCheck();
      },
      error:(err)=>{
        this.saving = false;
        this._toast.show(getErrorMessage(err),'error');
        this._cdr.markForCheck();
      }
    });
  }
}
