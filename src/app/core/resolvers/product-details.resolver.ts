import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, MaybeAsync, RedirectCommand, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { IProductRes } from '../models/product.model';
import { ProductService } from '../services/product.service';
import { catchError, of } from 'rxjs';

@Injectable({providedIn:'root'})
export class ProductDetailsResolver implements Resolve<IProductRes | null> {
     private _productService = inject(ProductService);
      private _router = inject(Router);
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): MaybeAsync<IProductRes | RedirectCommand | null> {
   
        const slug = route.paramMap.get('slug');
        if(slug){
        
           
            return this._productService.getProductBySlug(slug).pipe(catchError(err=>{
// a 404 is already redirected to the not-found page by the error interceptor
return of(null);
            }))
        }

return of(null)
       
    }
}
