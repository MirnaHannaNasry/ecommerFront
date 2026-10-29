import { IAddress } from './auth.model';

export interface IUser{
    name:string;
    email:string;
    _id:string;
    role:string;
    phone?:string;
    isBlocked?:boolean;
    addresses?:IAddress[];
    createdAt?:string;
}

export interface IUserListRes{
   message:string;
   page:number;
   totalPages:number;
   total:number;
   data:IUser[];
}

export interface IUserRes{
   message:string;
   data:IUser;
}
