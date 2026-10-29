import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { enveronment } from '../../../environments/env';
import { IOrderListRes, IOrderRes } from '../models/order.model';

@Injectable({providedIn:'root'})
export class OrderService {

    private _http = inject(HttpClient);
    private _apiURL = enveronment.apiURL + 'order';

    // the server calculates the total from the saved cart, we only send the address id
    placeOrder(addressId?:string){
        return this._http.post<IOrderRes>(this._apiURL, addressId ? {addressId} : {});
    }

    getMyOrders(page = 1, limit = 10){
        const params = new HttpParams().set('page', page).set('limit', limit);
        return this._http.get<IOrderListRes>(this._apiURL + '/my', {params});
    }

    getOrder(id:string){
        return this._http.get<IOrderRes>(this._apiURL + '/' + id);
    }

    cancelOrder(id:string){
        return this._http.patch(this._apiURL + '/' + id + '/cancel', {});
    }

    /* ---------- admin ---------- */

    getAllOrders(params:Record<string, any> = {}){
        let httpParams = new HttpParams();
        for(const key of Object.keys(params)){
            if(params[key] !== undefined && params[key] !== null && params[key] !== ''){
                httpParams = httpParams.set(key, String(params[key]));
            }
        }
        return this._http.get<IOrderListRes>(this._apiURL, {params:httpParams});
    }

    updateStatus(id:string, status:string){
        return this._http.patch<IOrderRes>(this._apiURL + '/' + id + '/status', {status});
    }

    getSalesReport(){
        return this._http.get<{message:string; data:any}>(enveronment.apiURL + 'report/sales');
    }
}
