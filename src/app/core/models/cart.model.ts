export interface ICartLine{
    productId:string;
    name:string;
    slug:string;
    imgURL?:string;
    unitPrice:number;       // numeric price used for every calculation
    oldPrice?:number;       // price the user saw before it changed
    stock:number;
    quantity:number;
    available:boolean;
    enoughStock:boolean;
    priceChanged:boolean;
}

export interface ICartRes{
    message:string;
    data:{
        items:any[];
        total:number;
        hasPriceChanges:boolean;
        canPlaceOrder:boolean;
    };
}
