import { HttpClient, HttpContext } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { enveronment } from '../../../environments/env';
import { IPage, IPageRes, PageKey } from '../models/page.model';
import { SILENT_REQUEST } from '../interceptors/silent-request';

@Injectable({ providedIn: 'root' })
export class PageService {

    private _http = inject(HttpClient);
    private _apiURL = enveronment.apiURL + 'page';

    getPage(key:PageKey){
        // silent: a page that was not written yet (404) is shown as a message, not as the not-found page
        return this._http.get<IPageRes>(this._apiURL + '/' + key, {context: new HttpContext().set(SILENT_REQUEST, true)});
    }

    // admin: creates the page if it was not written yet, otherwise updates it
    savePage(key:PageKey, body:Partial<IPage>){
        return this._http.put<IPageRes>(this._apiURL + '/' + key, body);
    }
}
