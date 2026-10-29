import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { UserService } from '../../core/services/user-service';
import { AuthService } from '../../core/services/auth.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { ToastService } from '../../core/services/toast.service';
import { IUser } from '../../core/models/user.model';
import { Pagination } from '../../shared/pagination/pagination';
import { getErrorMessage } from '../../core/utils/error.util';

@Component({
  imports: [DatePipe,Pagination],
  selector: 'app-user-list',
  styleUrl: './user-list.css',
  templateUrl: './user-list.html',
})
export class UserList implements OnInit,OnDestroy{
  private _userServic = inject(UserService);
  private _authService = inject(AuthService);
  private _confirmService = inject(ConfirmService);
  private _toast = inject(ToastService);
  private _cdr = inject(ChangeDetectorRef);

  users: IUser[] = [];
  myId = this._authService.getCurrentUser()?.id;
  loading = true;
  errorMessage = '';
  page = 1;
  totalPages = 1;
  search = '';
  private _timer:any;

  ngOnInit(): void {
    this.load(1);
  }

  load(page:number){
    this.loading = true;
    this._userServic.getAllUsers({page, limit:20, search:this.search.trim()}).subscribe({
      next:(res)=>{
        this.users = res.data;
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
    })
  }

  onSearch(value:string){
    this.search = value;
    clearTimeout(this._timer);
    this._timer = setTimeout(()=> this.load(1), 350);
  }

  toggleBlock(user:IUser){
    const block = !user.isBlocked;
    this._confirmService.ask({
      title: block ? 'Block this user?' : 'Unblock this user?',
      message: block ? `${user.name} will not be able to log in or order.` : `${user.name} will be able to log in again.`,
      confirmText: block ? 'Block' : 'Unblock',
      danger: block
    }).subscribe(confirmed=>{
      if(!confirmed){
        return;
      }
      this._userServic.setBlocked(user._id, block).subscribe({
        next:()=>{
          user.isBlocked = block;
          this._toast.show(block ? 'User blocked' : 'User unblocked');
          this._cdr.markForCheck();
        },
        error:(err)=> this._toast.show(getErrorMessage(err),'error')
      });
    });
  }

  ngOnDestroy(): void {
    clearTimeout(this._timer);
  }

}
