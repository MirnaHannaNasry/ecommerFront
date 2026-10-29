import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ILoginData } from '../../core/models/auth.model';
import { getErrorMessage } from '../../core/utils/error.util';

@Component({
  imports: [ReactiveFormsModule,RouterLink],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {

  private _authService = inject(AuthService);
  private _route = inject(ActivatedRoute);
  private _cdr = inject(ChangeDetectorRef);

  // set by the guards / checkout button: where to go after the login
  returnUrl = this._route.snapshot.queryParamMap.get('returnUrl');
  errorMessage = '';
  loading = false;

  loginForm= new FormGroup({
    email: new FormControl('',[Validators.required, Validators.email]),
    password: new FormControl('',Validators.required)
  })


  onSubmit(){
    this.loginForm.markAllAsTouched();
    if(this.loginForm.invalid){
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    this._authService.login(this.loginForm.value as ILoginData, this.returnUrl).subscribe({
      next:(res)=>{
        this.loading = false;
      },
      error:(err)=>{
        this.errorMessage = getErrorMessage(err,'Login failed');
        this.loading = false;
        this._cdr.markForCheck();
      }

    })
  }

}
