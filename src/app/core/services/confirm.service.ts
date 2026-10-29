import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface IConfirmOptions{
    title:string;
    message:string;
    confirmText?:string;
    cancelText?:string;
    danger?:boolean;
}

export interface IConfirmState extends IConfirmOptions{
    answer:(value:boolean)=>void;
}

@Injectable({providedIn:'root'})
export class ConfirmService {
    private _state = new BehaviorSubject<IConfirmState | null>(null);

    getState(){
        return this._state.asObservable();
    }

    // emits true when the user confirms, false when he cancels
    ask(options:IConfirmOptions):Observable<boolean>{
        return new Observable<boolean>(subscriber=>{
            this._state.next({
                ...options,
                answer:(value:boolean)=>{
                    this._state.next(null);
                    subscriber.next(value);
                    subscriber.complete();
                }
            });
        });
    }
}
