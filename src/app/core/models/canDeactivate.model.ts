export interface ICanDeactivate{
    canDeactivate: ()=>boolean | Promise<boolean>;
}