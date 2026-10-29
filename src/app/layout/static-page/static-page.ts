import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PageService } from '../../core/services/page.service';
import { AuthService } from '../../core/services/auth.service';
import { IPage, PageKey } from '../../core/models/page.model';
import { getErrorMessage } from '../../core/utils/error.util';

// shows the "about" and "policy" pages the admin writes in the dashboard.
// The route tells which one: { path:'about', data:{ key:'about' } }
@Component({
  imports: [RouterLink],
  selector: 'app-static-page',
  styleUrl: './static-page.css',
  templateUrl: './static-page.html',
})
export class StaticPage implements OnInit{
  private _route = inject(ActivatedRoute);
  private _pageService = inject(PageService);
  private _authService = inject(AuthService);
  private _cdr = inject(ChangeDetectorRef);

  page: IPage | null = null;
  loading = true;
  notWritten = false;
  errorMessage = '';
  isAdmin = this._authService.ifLogedinWithRole('admin');

  ngOnInit(): void {
    const key = this._route.snapshot.data['key'] as PageKey;
    this._pageService.getPage(key).subscribe({
      next:(res)=>{
        this.page = res.data;
        this.loading = false;
        this._cdr.markForCheck();
      },
      error:(err)=>{
        if(err?.status === 404){
          this.notWritten = true;
        }else{
          this.errorMessage = getErrorMessage(err,'Could not load this page');
        }
        this.loading = false;
        this._cdr.markForCheck();
      }
    });
  }
}
