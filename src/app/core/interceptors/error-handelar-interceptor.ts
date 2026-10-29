import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { SILENT_REQUEST } from './silent-request';

export const errorHandelarInterceptor: HttpInterceptorFn = (req, next) => {
  const _router= inject(Router);
  const _authService = inject(AuthService);
  const _toast = inject(ToastService);
  const isPageLoad = req.method === 'GET' && !req.context.get(SILENT_REQUEST);

  return next(req).pipe(catchError((error)=>{

    if(error.status === 401 && !req.url.includes('/auth/')){
      // expired / invalid token, or the user no longer exists: drop the session
      _authService.logOut();
      _toast.show('Your session has expired, please log in again','error');
      _router.navigate(['/login'],{queryParams:{returnUrl:_router.url}});
    }
    else if(error.status === 403 && isPageLoad){
      _router.navigate(['/login'],{queryParams:{returnUrl:_router.url}});
    }
    else if(error.status === 404 && isPageLoad){
      _router.navigate(['/not-found'])
    }
    else if(error.status === 500 && !req.context.get(SILENT_REQUEST)){
      alert(error.error?.message || `something went wrong, please try again`)
    }
    return throwError(()=>error)
  }));
};
