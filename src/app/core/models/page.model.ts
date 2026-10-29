// the backend keeps three editable pages: policy, about and contact
export type PageKey = 'policy' | 'about' | 'contact';

export interface IContactInfo{
    email?:string;
    phone?:string;
    whatsapp?:string;
    address?:string;
    facebook?:string;
    instagram?:string;
}

export interface IPage{
    _id?:string;
    key:PageKey;
    title:string;
    content:string;
    contact?:IContactInfo;
}

export interface IPageRes{
    message:string;
    data:IPage;
}
