import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
 const _authService= inject(AuthService);
 const _router=inject(Router);
 if(_authService.ifLogedinWithRole('user')){
  return true;
 }
 else{
 // remember where the user wanted to go, so we can bring him back after login
 _router.navigate(['/login'],{queryParams:{returnUrl:state.url}});
return false;
 }
};
