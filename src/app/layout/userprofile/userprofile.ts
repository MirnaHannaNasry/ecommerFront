import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserService } from '../../core/services/user-service';
import { IUser } from '../../core/models/user.model';
import { getErrorMessage } from '../../core/utils/error.util';

@Component({
  imports: [RouterLink],
  selector: 'app-userprofile',
  styleUrl: './userprofile.css',
  templateUrl: './userprofile.html',
})
export class Userprofile implements OnInit{
  private _userService = inject(UserService);
  private _cdr = inject(ChangeDetectorRef);
  user: IUser | null = null;
  errorMessage = '';

  ngOnInit(): void {
    this._userService.getMe().subscribe({
      next:(res)=>{
        this.user = res.data;
        this._cdr.markForCheck();
      },
      error:(err)=>{
        this.errorMessage = getErrorMessage(err);
        this._cdr.markForCheck();
      }
    });
  }
}
