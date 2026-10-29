import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { enveronment } from '../../../environments/env';
import { ILoginData, ILoginRes, ISignupData, IToken } from '../models/auth.model';
import { BehaviorSubject, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';

@Injectable({providedIn:'root'})
export class AuthService {

    private _http= inject(HttpClient);
    private _apiURL = enveronment.apiURL + 'auth';
    private _router = inject(Router);

    private userData = new BehaviorSubject<IToken | null>(null);

    getUserData(){
        return this.userData.asObservable()
    }

    getCurrentUser(){
        return this.userData.value;
    }

    checkIfLogedin(){
        const token = this.getToken();
        if(token){
            const decode = this.decodeToken(token);
           
            if(decode?.exp){
            const expiryDate = decode.exp * 1000;
            if(Date.now() < expiryDate){
              return   this.userData.next(decode);
            }
            }
          
        }
this.logOut();
    }

     ifLogedinWithRole(role:string){
        const token = this.getToken();
        if(token){
            const decode = this.decodeToken(token);
           
            if(decode?.exp){
            const expiryDate = decode.exp * 1000;
            if(Date.now() < expiryDate){
              if(decode.role == role){
                return true;
              }
            }
            }
          
        }

return false;
    }

    logOut(){
this.deleteToken();
this.userData.next(null);
    }

    register(data:ISignupData){
        return this._http.post(this._apiURL + '/signup',data);
    }

    // returnUrl: where to go after a successful login (e.g. /checkout)
    login(data:ILoginData, returnUrl?:string | null){
return this._http.post<ILoginRes>(this._apiURL + '/login',data).pipe(tap((res)=>{
    if(res.token){
        const myUserInfo = this.decodeToken(res.token)
        if(myUserInfo){
             this.saveToken(res.token);
             this.userData.next(myUserInfo);
           if(returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('//')){
            this._router.navigateByUrl(returnUrl);
           }
           else if(myUserInfo.role === 'admin'){
            this._router.navigate(['/dashboard']);
           }else
           {
            this._router.navigate(['/']);
           }
             

        }
       


    }
    
}));
    }

private tokenKey='token';
    private saveToken(token:string){
localStorage.setItem(this.tokenKey,token);
    }

    getToken(){
        return localStorage.getItem(this.tokenKey);
    }

    private deleteToken(){
        localStorage.removeItem(this.tokenKey);
    }

    decodeToken(token:string):IToken | null{
        try{
        return jwtDecode<IToken>(token);

        }
        catch(err){
            return null

        }

    }

}
