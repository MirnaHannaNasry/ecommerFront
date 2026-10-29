export interface IFaq{
    _id:string;
    question:string;
    answer:string;
}

export interface IFaqListRes{
    message:string;
    data:IFaq[];
}
