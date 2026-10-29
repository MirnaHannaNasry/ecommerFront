export interface ICategory{
    _id:string;
    name:string;
    slug:string;
    isActive?:boolean;
}

export interface IProduct{
    _id:string;
    name:string;
    price:number;
    desc:string;
    stock:number;
    slug:string;
    imgURL:string;
    category?: ICategory | string;
    isTrending?:boolean;
    isActive?:boolean;
    isDeleted?:boolean;
}

export interface IProductsListRes{
    message:string;
    page?:number;
    totalPages?:number;
    total?:number;
    data:IProduct[];
}

export interface IProductRes{
    message:string;
    data:IProduct
}
