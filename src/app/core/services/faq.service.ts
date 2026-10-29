import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { enveronment } from '../../../environments/env';
import { IFaqListRes } from '../models/faq.model';

@Injectable({ providedIn: 'root' })
export class FaqService {

    private _http = inject(HttpClient);
    private _apiURL = enveronment.apiURL + 'faq';

    getAllFaqs(){
        return this._http.get<IFaqListRes>(this._apiURL);
    }

    // admin
    addFaq(body:{question:string; answer:string}){
        return this._http.post(this._apiURL, body);
    }

    updateFaq(id:string, body:{question:string; answer:string}){
        return this._http.patch(this._apiURL + '/' + id, body);
    }

    deleteFaq(id:string){
        return this._http.delete(this._apiURL + '/' + id);
    }
}
