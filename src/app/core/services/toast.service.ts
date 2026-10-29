import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface IToast{
    id:number;
    text:string;
    type:'success' | 'error' | 'info';
}

@Injectable({providedIn:'root'})
export class ToastService {
    private _toasts = new BehaviorSubject<IToast[]>([]);
    private _id = 0;

    getToasts(){
        return this._toasts.asObservable();
    }

    show(text:string, type:'success' | 'error' | 'info' = 'success'){
        const id = ++this._id;
        this._toasts.next([...this._toasts.value, {id,text,type}]);
        setTimeout(()=> this.close(id), type === 'error' ? 4500 : 3000);
    }

    close(id:number){
        this._toasts.next(this._toasts.value.filter(t=> t.id !== id));
    }
}
