import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { enveronment } from '../../../environments/env';
import { ICategoryListRes } from '../models/category.model';

@Injectable({providedIn:'root'})
export class CategoryService {

    private _http = inject(HttpClient);
    private _apiURL = enveronment.apiURL + 'category';

    getAllCategories(){
        return this._http.get<ICategoryListRes>(this._apiURL);
    }

    addCategory(body:{name:string; slug:string; isActive:boolean}){
        return this._http.post(this._apiURL, body);
    }

    updateCategory(id:string, body:{name:string; isActive:boolean}){
        return this._http.patch(this._apiURL + '/' + id, body);
    }

    deleteCategory(id:string){
        return this._http.delete(this._apiURL + '/' + id);
    }
}
