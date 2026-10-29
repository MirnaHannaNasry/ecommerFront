import { HttpClient, HttpContext } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, concat, map, Observable, of, switchMap, tap, throwError, toArray } from 'rxjs';
import { enveronment } from '../../../environments/env';
import { ICartLine, ICartRes } from '../models/cart.model';
import { IProduct } from '../models/product.model';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';
import { SILENT_REQUEST } from '../interceptors/silent-request';

/*
  One cart, two places to keep it:
   - guest        -> localStorage (survives a refresh)
   - logged user  -> the backend cart (/cart). The guest cart is merged into it right after login.
  Every price calculation uses numbers (price * quantity), never formatted text.
*/
@Injectable({providedIn:'root'})
export class CartService {

    private _http = inject(HttpClient);
    private _auth = inject(AuthService);
    private _toast = inject(ToastService);
    private _apiURL = enveronment.apiURL + 'cart';
    private _storageKey = 'guest_cart';
    private _silent = { context: new HttpContext().set(SILENT_REQUEST, true) };

    private _lines = new BehaviorSubject<ICartLine[]>(this.readGuest());
    private _loading = new BehaviorSubject<boolean>(false);
    private _serverMode = false;

    lines$ = this._lines.asObservable();
    loading$ = this._loading.asObservable();
    count$ = this._lines.pipe(map(lines => lines.reduce((sum, l) => sum + l.quantity, 0)));
    total$ = this._lines.pipe(map(lines => CartService.getTotal(lines)));

    constructor(){
        this._auth.getUserData().subscribe(user => {
            if(user && user.role === 'user'){
                this._serverMode = true;
                this.mergeGuestAndLoad();
            }else{
                this._serverMode = false;
                this._lines.next(this.readGuest());
            }
        });
    }

    /* ----------------------------- calculations ----------------------------- */

    static getTotal(lines:ICartLine[]):number{
        return lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
    }

    static canCheckout(lines:ICartLine[]):boolean{
        return lines.length > 0 && lines.every(l => l.available && l.enoughStock && !l.priceChanged);
    }

    getLine(productId:string){
        return this._lines.value.find(l => l.productId === productId);
    }

    /* -------------------------------- actions -------------------------------- */

    add(product:IProduct, quantity:number):Observable<unknown>{
        if(!Number.isInteger(quantity) || quantity < 1){
            return throwError(() => new Error('Quantity must be at least 1'));
        }
        if(product.stock <= 0){
            return throwError(() => new Error('This product is out of stock'));
        }
        const inCart = this.getLine(product._id)?.quantity ?? 0;
        if(inCart + quantity > product.stock){
            return throwError(() => new Error(
                `Only ${product.stock} in stock` + (inCart ? ` (you already have ${inCart} in your cart)` : '')));
        }

        if(this._serverMode){
            return this._http.post<ICartRes>(this._apiURL + '/items', {product: product._id, quantity}, this._silent)
                .pipe(tap(res => this._lines.next(this.mapServer(res.data))), map(() => true));
        }

        const lines = [...this._lines.value];
        const existing = lines.find(l => l.productId === product._id);
        if(existing){
            // same product again: update the existing line, never add a duplicate
            existing.quantity += quantity;
            existing.stock = product.stock;
            existing.unitPrice = product.price;
        }else{
            lines.push({
                productId: product._id, name: product.name, slug: product.slug, imgURL: product.imgURL,
                unitPrice: product.price, stock: product.stock, quantity,
                available: true, enoughStock: true, priceChanged: false
            });
        }
        this.saveGuest(lines);
        return of(true);
    }

    setQuantity(productId:string, quantity:number):Observable<unknown>{
        const line = this.getLine(productId);
        if(!line || quantity < 1){
            return of(false);
        }
        if(quantity > line.stock){
            return throwError(() => new Error(`Only ${line.stock} in stock`));
        }
        const before = this._lines.value;
        // update the screen immediately, undo it if the server refuses
        const after = before.map(l => l.productId === productId ? {...l, quantity} : l);
        this._lines.next(after);

        if(!this._serverMode){
            this.saveGuest(after);
            return of(true);
        }
        return this._http.patch<ICartRes>(this._apiURL + '/items/' + productId, {quantity}, this._silent).pipe(
            tap(res => this._lines.next(this.mapServer(res.data))),
            catchError(err => { this._lines.next(before); return throwError(() => err); })
        );
    }

    remove(productId:string):Observable<unknown>{
        const before = this._lines.value;
        const after = before.filter(l => l.productId !== productId);
        this._lines.next(after);

        if(!this._serverMode){
            this.saveGuest(after);
            return of(true);
        }
        return this._http.delete<ICartRes>(this._apiURL + '/items/' + productId, this._silent).pipe(
            tap(res => this._lines.next(this.mapServer(res.data))),
            catchError(err => { this._lines.next(before); return throwError(() => err); })
        );
    }

    acceptPriceChanges(){
        return this._http.post<ICartRes>(this._apiURL + '/accept-price-changes', {}, this._silent)
            .pipe(tap(res => this._lines.next(this.mapServer(res.data))));
    }

    // re-read the cart from the server (stock and prices may have changed)
    reload():Observable<unknown>{
        if(!this._serverMode){
            this._lines.next(this.readGuest());
            return of(true);
        }
        this._loading.next(true);
        return this._http.get<ICartRes>(this._apiURL, this._silent).pipe(
            tap({
                next: res => { this._lines.next(this.mapServer(res.data)); this._loading.next(false); },
                error: () => this._loading.next(false)
            }),
            map(() => true)
        );
    }

    /* ------------------------------- internals ------------------------------- */

    private mergeGuestAndLoad(){
        const guest = this.readGuest();
        this._loading.next(true);
        // one request after the other, so they don't overwrite each other on the server
        const posts = guest.map(g =>
            this._http.post(this._apiURL + '/items', {product: g.productId, quantity: g.quantity}, this._silent)
                .pipe(catchError(() => of(null))));

        (posts.length ? concat(...posts).pipe(toArray()) : of([] as any[])).pipe(
            tap(results => {
                if(guest.length){
                    this.saveGuest([]);
                    const failed = results.filter(r => r === null).length;
                    if(failed){
                        this._toast.show(`${failed} item(s) could not be added (stock or availability)`, 'info');
                    }
                }
            }),
            switchMap(() => this._http.get<ICartRes>(this._apiURL, this._silent))
        ).subscribe({
            next: res => { this._lines.next(this.mapServer(res.data)); this._loading.next(false); },
            error: () => { this._lines.next([]); this._loading.next(false); }
        });
    }

    private mapServer(data:ICartRes['data']):ICartLine[]{
        return (data?.items ?? []).map((i:any):ICartLine => ({
            productId: i.product?._id ?? i.productId,
            name: i.product?.name ?? 'Unavailable product',
            slug: i.product?.slug ?? '',
            imgURL: i.product?.imgURL,
            unitPrice: Number(i.currentPrice ?? i.price),
            oldPrice: i.priceChanged ? Number(i.price) : undefined,
            stock: i.product?.stock ?? 0,
            quantity: i.quantity,
            available: !!i.available,
            enoughStock: !!i.enoughStock,
            priceChanged: !!i.priceChanged
        }));
    }

    private readGuest():ICartLine[]{
        try{
            const raw = JSON.parse(localStorage.getItem(this._storageKey) || '[]');
            return Array.isArray(raw) ? raw : [];
        }catch{
            return [];
        }
    }

    private saveGuest(lines:ICartLine[]){
        this._lines.next(lines);
        try{
            localStorage.setItem(this._storageKey, JSON.stringify(lines));
        }catch{}
    }
}
