import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { enveronment } from '../../../environments/env';
import { IProduct, IProductRes, IProductsListRes } from '../models/product.model';

@Injectable({providedIn:'root'})
export class ProductService {

    private _http=inject(HttpClient);
    private _apiURL = enveronment.apiURL + 'product';

    // params: page, limit, search, category (slug), sort, order, inStock, trending, all (admin)
    getAllProducts(params:Record<string, any> = {}){
        let httpParams = new HttpParams();
        for(const key of Object.keys(params)){
            const value = params[key];
            if(value !== undefined && value !== null && value !== ''){
                httpParams = httpParams.set(key, String(value));
            }
        }
        return this._http.get<IProductsListRes>(this._apiURL,{params:httpParams});
    }

    getProductBySlug(slug:string){
        return this._http.get<IProductRes>(this._apiURL + '/' + slug);

    }

    getRelatedProducts(slug:string){
        return this._http.get<IProductsListRes>(this._apiURL + '/related-products/' + slug)
    }

    /* ---------- admin ---------- */

    // body is a FormData because the backend expects the image in the "img" field
    addProduct(body:FormData){
        return this._http.post<IProductRes>(this._apiURL, body);
    }

    updateProduct(id:string, body:FormData){
        return this._http.patch<IProductRes>(this._apiURL + '/' + id, body);
    }

    deleteProduct(id:string){
        return this._http.delete(this._apiURL + '/' + id);
    }

    restoreProduct(id:string){
        return this._http.patch(this._apiURL + '/' + id + '/restore', {});
    }

}
