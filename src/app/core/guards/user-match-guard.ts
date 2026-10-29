import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const userMatchGuard: CanMatchFn = (route, segments) => {
   const _authService= inject(AuthService);
 const _router=inject(Router);
 if(_authService.ifLogedinWithRole('user')){
  return true;
 }
 else{
 _router.navigate(['/login'],{queryParams:{returnUrl:'/' + segments.map(s=>s.path).join('/')}});
return false;
 }
};
