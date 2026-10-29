import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageService } from '../../core/services/page.service';
import { AuthService } from '../../core/services/auth.service';
import { IPage } from '../../core/models/page.model';
import { getErrorMessage } from '../../core/utils/error.util';

@Component({
  imports: [RouterLink],
  selector: 'app-contact',
  styleUrl: './contact.css',
  templateUrl: './contact.html',
})
export class Contact implements OnInit{
  private _pageService = inject(PageService);
  private _authService = inject(AuthService);
  private _cdr = inject(ChangeDetectorRef);

  page: IPage | null = null;
  loading = true;
  notWritten = false;
  errorMessage = '';
  isAdmin = this._authService.ifLogedinWithRole('admin');

  ngOnInit(): void {
    this._pageService.getPage('contact').subscribe({
      next:(res)=>{
        this.page = res.data;
        this.loading = false;
        this._cdr.markForCheck();
      },
      error:(err)=>{
        if(err?.status === 404){
          this.notWritten = true;      // the admin did not write this page yet
        }else{
          this.errorMessage = getErrorMessage(err,'Could not load the contact details');
        }
        this.loading = false;
        this._cdr.markForCheck();
      }
    });
  }

  // wa.me needs the number with digits only
  get whatsappLink(){
    const digits = (this.page?.contact?.whatsapp ?? '').replace(/\D/g,'');
    return digits ? 'https://wa.me/' + digits : '';
  }

  // social links may be saved as a full link or only the account name
  link(value:string | undefined, base:string){
    if(!value){
      return '';
    }
    return value.startsWith('http') ? value : base + value.replace(/^@/,'');
  }
}
