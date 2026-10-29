import { Routes } from '@angular/router';
import { Layout } from './layout/layout';
import { Home as HomeLayout } from './layout/home/home';
import { Productslist } from './layout/productslist/productslist';
import { Dashboard } from './dashboard/dashboard';
import { Home } from './dashboard/home/home';
import { Login } from './layout/login/login';
import { Signup } from './layout/signup/signup';
import { NotFound } from './shared/not-found/not-found';
import { ProductDetails } from './layout/productslist/product-details/product-details';
import { Userprofile } from './layout/userprofile/userprofile';
import { UserList } from './dashboard/user-list/user-list';
import { authGuard } from './core/guards/auth-guard';
import { adminGuard } from './core/guards/admin-guard';
import { userMatchGuard } from './core/guards/user-match-guard';
import { deactivateGuard } from './core/guards/deactivate-guard';
import { ProductDetailsResolver } from './core/resolvers/product-details.resolver';
import { Cart } from './layout/cart/cart';
import { Checkout } from './layout/checkout/checkout';
import { OrderSuccess } from './layout/order-success/order-success';
import { MyOrders } from './layout/my-orders/my-orders';
import { ProductManage } from './dashboard/product-manage/product-manage';
import { CategoryManage } from './dashboard/category-manage/category-manage';
import { OrderManage } from './dashboard/order-manage/order-manage';
import { Faq } from './layout/faq/faq';
import { Contact } from './layout/contact/contact';
import { StaticPage } from './layout/static-page/static-page';
import { FaqManage } from './dashboard/faq-manage/faq-manage';
import { PageManage } from './dashboard/page-manage/page-manage';

export const routes: Routes = [
    {path:'',component:Layout, children:[
        {path:'',redirectTo:'home',pathMatch:'full'},
        {path:'home',component:HomeLayout},
        {path:'product-list',component:Productslist},
        {path: 'product-list/:slug',component:ProductDetails,resolve:{
            productRes: ProductDetailsResolver
        }},
        {path:'cart',component:Cart},
        {path:'checkout',component:Checkout,canActivate:[authGuard]},
        {path:'order-success/:id',component:OrderSuccess,canActivate:[authGuard]},
        {path:'my-orders',component:MyOrders,canActivate:[authGuard]},
        {path:'login',component:Login},
        {path:'signup',component:Signup,canDeactivate:[deactivateGuard]},
        // {path:'user-profile', component:Userprofile,canActivate:[authGuard]}
         {path:'user-profile', loadComponent:()=> import('./layout/userprofile/userprofile').then(c=> c.Userprofile),canMatch:[userMatchGuard]},
         {path:'faq',component:Faq},
         {path:'contact',component:Contact},
         {path:'about',component:StaticPage,data:{key:'about'}},
         {path:'policy',component:StaticPage,data:{key:'policy'}}
    ]},
    {path:'dashboard',component:Dashboard, canActivate:[adminGuard],children:[
        {path:'',redirectTo:'home',pathMatch:'full'},
        {path:'home',component:Home},
        {path:'product-manage',component:ProductManage},
        {path:'category-manage',component:CategoryManage},
        {path:'order-manage',component:OrderManage},
        {path:'faq-manage',component:FaqManage},
        {path:'page-manage',component:PageManage},
        {path:'user-list',component:UserList}
    ]},
    {path:'**',component:NotFound}
];
