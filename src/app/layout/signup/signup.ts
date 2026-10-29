import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ICanDeactivate } from '../../core/models/canDeactivate.model';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { getErrorMessage } from '../../core/utils/error.util';

@Component({
  imports: [ReactiveFormsModule,RouterLink],
  selector: 'app-signup',
  styleUrl: './signup.css',
  templateUrl: './signup.html',
})
export class Signup implements ICanDeactivate{
private _authService = inject(AuthService);
private _toast = inject(ToastService);
private _route = inject(ActivatedRoute);
private _cdr = inject(ChangeDetectorRef);

returnUrl = this._route.snapshot.queryParamMap.get('returnUrl');
errorMessage = '';
loading = false;

canDeactivate():boolean {
if(this.myForm.dirty){
  return confirm('are you sure?')
}
return true;
}
myForm = new FormGroup({
  name: new FormControl('',Validators.required),
  phone: new FormControl('',[Validators.required, Validators.pattern(/^\+?\d{10,15}$/)]),
  email: new FormControl('',[Validators.required, Validators.email]),
  password:new FormControl('',[Validators.required, Validators.minLength(8)]),
  governorate: new FormControl(''),
  city: new FormControl('',Validators.required),
  street: new FormControl('',Validators.required),
  notes: new FormControl('')
})

invalid(name:string){
  const c = this.myForm.get(name);
  return !!c && c.touched && c.invalid;
}

onSubmit(){
  this.myForm.markAllAsTouched();
  if(this.myForm.invalid){
    return;
  }
  const v = this.myForm.value;
  this.loading = true;
  this.errorMessage = '';
  this._authService.register({
    name: v.name as string, email: v.email as string, password: v.password as string, phone: v.phone as string,
    address:{ label:'Home', governorate: v.governorate || '', city: v.city as string, street: v.street as string, notes: v.notes || '' }
  }).subscribe({
    next:()=>{
      // the form is saved, so the "are you sure?" guard must not ask when we leave
      this.myForm.markAsPristine();
      this._toast.show('Your account is ready');
      this._authService.login({email:v.email as string, password:v.password as string}, this.returnUrl).subscribe({
        error:(err)=>{
          this.errorMessage = getErrorMessage(err);
          this.loading = false;
          this._cdr.markForCheck();
        }
      });
    },
    error:(err)=>{
      this.errorMessage = getErrorMessage(err,'Could not create your account');
      this.loading = false;
      this._cdr.markForCheck();
    }
  });
}
}
