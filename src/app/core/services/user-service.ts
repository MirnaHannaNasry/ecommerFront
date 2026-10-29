import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { enveronment } from '../../../environments/env';
import { IUserListRes, IUserRes } from '../models/user.model';
import { IAddress } from '../models/auth.model';

@Injectable({providedIn:'root'})
export class UserService {

    private _http=inject(HttpClient);
    private _apiURL = enveronment.apiURL + 'user';

    // admin: page, limit, search
    getAllUsers(params:Record<string, any> = {}){
        let httpParams = new HttpParams();
        for(const key of Object.keys(params)){
            if(params[key] !== undefined && params[key] !== null && params[key] !== ''){
                httpParams = httpParams.set(key, String(params[key]));
            }
        }
        return this._http.get<IUserListRes>(this._apiURL,{params:httpParams})
    }

    setBlocked(id:string, blocked:boolean){
        return this._http.patch(this._apiURL + '/' + id + (blocked ? '/block' : '/unblock'), {});
    }

    getMe(){
        return this._http.get<IUserRes>(this._apiURL + '/me');
    }

    updateMe(body:{name?:string; phone?:string}){
        return this._http.patch(this._apiURL + '/me', body);
    }

    addAddress(body:IAddress){
        return this._http.post(this._apiURL + '/me/addresses', body);
    }
}
