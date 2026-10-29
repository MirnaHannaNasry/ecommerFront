import { IUser } from './user.model';

export interface ILoginData{
    email:string;
    password:string;
}

export interface ILoginRes{
    status:string;
    token:string;
    data:{ user:IUser };
}

export interface IAddress{
    _id?:string;
    label?:string;
    governorate?:string;
    city:string;
    street:string;
    notes?:string;
    isDefault?:boolean;
}

export interface ISignupData{
    name:string;
    email:string;
    password:string;
    phone:string;
    address:IAddress;
}

export interface IToken{
    id:string;
    name:string;
    role:string;
    exp:number;
}
