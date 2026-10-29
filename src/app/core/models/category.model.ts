import { ICategory } from './product.model';

export interface ICategoryListRes{
    status:string;
    results:number;
    data:{ categories:ICategory[] };
}
