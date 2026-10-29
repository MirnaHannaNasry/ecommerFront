import { IAddress } from './auth.model';

export type OrderStatus = 'pending' | 'preparing' | 'shipped' | 'delivered' | 'cancelled' | 'rejected' | 'refunded';

export const ORDER_STATUSES: OrderStatus[] =
    ['pending','preparing','shipped','delivered','cancelled','rejected','refunded'];

export interface IOrderItem{
    product:string;
    name:string;
    imgURL?:string;
    quantity:number;
    price:number;
}

export interface IOrder{
    _id:string;
    items:IOrderItem[];
    status:OrderStatus;
    totalPrice:number;
    paymentMethod:string;
    customer?:{ name?:string; email?:string; phone?:string };
    shippingAddress?:IAddress;
    createdAt:string;
}

export interface IOrderRes{
    message:string;
    data:IOrder;
}

export interface IOrderListRes{
    message:string;
    page:number;
    totalPages:number;
    total:number;
    data:IOrder[];
}
