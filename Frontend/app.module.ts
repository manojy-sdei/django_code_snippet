import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { HttpClientModule, HttpClientJsonpModule } from '@angular/common/http'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ChartsModule } from 'ng2-charts';
import { UIRouterModule } from "@uirouter/angular";
import { LoadingModule } from 'ngx-loading';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import {RouterModule, Routes} from '@angular/router';
import {SmoothScrollDirective,SmoothScrollToDirective} from "ng2-smooth-scroll";

/**************NgPrime****/
import { GrowlModule } from 'primeng/primeng';
import { ConfirmDialogModule, ConfirmationService } from 'primeng/primeng';
import {GMapModule} from 'primeng/primeng';
import {DropdownModule} from 'primeng/primeng';
import { DialogModule } from 'primeng/primeng';

// Services
import { GoogleMapService } from './services/google-map.service';
import { GooglePlacesService } from './services/google-places.service';
import { GoogleDrawingService } from './services/google-drawing.service';
import { CustomHttpService } from './services/custom-http.service';
import { HttpService } from './services/http.service';
import { DataService } from './services/data.service';
import { FrontEndService } from './services/front-end.service';
import { ApiService } from './services/api.service';
import { ZillowService } from './services/zillow/zillow.service';
import { UserService } from './services/user/user.service';
import { FaqService } from './services/faq/faq.service';
import { PaymentService } from './services/payment.service';
import { MailchimpsService } from './services/mailchimps/mailchimps.service';
import {GoogleAnalyticsEventsService} from "./services/google-analytics-events.service";


// Components
import { AppComponent } from './app.component';
import { LawnAnalysisComponent } from './components/lawn-analysis/lawn-analysis.component';
import { HomeNewComponent } from './components/home-new/home-new.component';
import { NewHeaderComponent } from './components/new-header/new-header.component';
import { NewFooterComponent } from './components/new-footer/new-footer.component';
import { AmericanLawnComponent } from './components/american-lawn/american-lawn.component';
import { OurMethodComponent } from './components/our-method/our-method.component';
import { OurIngredientsComponent } from './components/our-ingredients/our-ingredients.component';
import { RegisterComponent } from './components/register/register.component';
import { RegisterHeaderComponent } from './components/register-header/register-header.component';
import { RegistrationStepComponent } from './components/registration-step/registration-step.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { LawnAreaComponent } from './components/lawn-area/lawn-area.component';
import { LineChartComponent } from './components/line-chart/line-chart.component';
import { ProductPlanComponent } from './components/product-plan/product-plan.component';
import { AboutYourLawnComponent } from './components/about-your-lawn/about-your-lawn.component';
import { YourLawnComponent } from './components/your-lawn/your-lawn.component';
import { SavePlanComponent } from './components/save-plan/save-plan.component';
import { PrairieGuaranteeComponent } from './components/prairie-guarantee/prairie-guarantee.component';
import { ContactUsComponent } from './components/contact-us/contact-us.component';
import { LoginComponent } from './components/login/login.component';
import { ReferAFriendComponent } from './components/refer-a-friend/refer-a-friend.component';
import { ThankYouComponent } from './components/thank-you/thank-you.component';
import { MyAccountComponent } from './components/my-account/my-account.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { EditProfileComponent } from './components/edit-profile/edit-profile.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { PreLaunchComponent } from './components/pre-launch/pre-launch.component';
import { SuccessComponent } from './components/success/success.component';
import { WelcomeHeaderComponent } from './components/welcome-header/welcome-header.component';
import { WelcomeFooterComponent } from './components/welcome-footer/welcome-footer.component';
import { RefersComponent } from './components/refers/refers.component';
import { MilestoneWidgetComponent } from './components/milestone-widget/milestone-widget.component';
import { ReferHeaderComponent } from './components/refer-header/refer-header.component';
import { ReferFooterComponent } from './components/refer-footer/refer-footer.component';
import { MyLawnComponent } from './components/my-lawn/my-lawn.component';
import { RainChartComponent } from './components/rain-chart/rain-chart.component';
import { GrassChartComponent } from './components/grass-chart/grass-chart.component';
import { TempChartComponent } from './components/temp-chart/temp-chart.component';
import { MoreQuestionsComponent } from './components/more-questions/more-questions.component';
import { ProductComponent } from './components/product/product.component';
import { CheckLawnComponent } from './components/check-lawn/check-lawn.component';
import { ManualReviewComponent } from './components/manual-review/manual-review.component';
import { ThankyouComponent } from './components/thankyou/thankyou.component';
import { WelcomeBackComponent } from './components/welcome-back/welcome-back.component';
import { AddLawnAddressComponent } from './components/add-lawn-address/add-lawn-address.component';



// Routing States
const appRoutes: Routes = [
  //{path: '', component: WelcomeComponent},
  //{path: '', component: PreLaunchComponent},
  {path: 'success', component: SuccessComponent},
  {path: '', component: HomeNewComponent},
  {path: 'american-lawn', component: AmericanLawnComponent}, 
  {path: 'our-method', component: OurMethodComponent}, 
  {path: 'our-ingredients', component: OurIngredientsComponent}, 
  {path: 'sunday-guarantee', component: PrairieGuaranteeComponent}, 
  {path: 'contact-us', component: ContactUsComponent}, 
  {path: 'register', component: RegisterComponent}, 
  {path: 'login', component: LoginComponent},
  {path: 'add-lawn-address', component: AddLawnAddressComponent},
  {path: 'registration-step', component: RegistrationStepComponent}, 
  {path: 'last-step', component: MoreQuestionsComponent}, 
  {path: 'check-lawn', component: CheckLawnComponent},
  {path: 'about-your-lawn', component: AboutYourLawnComponent}, 
  {path: 'your-lawn', component: YourLawnComponent},
  {path: 'my-account', component: MyAccountComponent},
  {path: 'change-password', component: ChangePasswordComponent},
  {path: 'edit-profile', component: EditProfileComponent},
  {path: 'save-plan', component: SavePlanComponent}, 
  {path: 'lawn-area', component: LawnAreaComponent},
  {path: 'lawn-analysis', component: LawnAnalysisComponent},
  {path: 'lawn-review', component: ManualReviewComponent}, 
  // {path: '', component: RefersComponent}, 
  // {path: 'milestone-widget', component: MilestoneWidgetComponent}, 
  {path: 'refer-a-friend', component: ReferAFriendComponent}, 
  {path: 'thank-you', component: ThankYouComponent}, 
  {path: 'thankyou', component: ThankyouComponent}, 
  {path: 'product-plan', component: ProductPlanComponent}, 
  {path: 'product', component: ProductComponent}, 
  {path: 'checkout', component: CheckoutComponent}, 
  {path: 'my-lawn', component: MyLawnComponent},
  {path: 'forgot-password', component: ForgotPasswordComponent},
  {path: 'reset-password', component: ResetPasswordComponent},
  {path: 'welcome-back', component: WelcomeBackComponent},
  {path: '**', component: HomeNewComponent},
];

@NgModule({
  declarations: [
    SmoothScrollDirective,
    SmoothScrollToDirective,
    AppComponent,
    LawnAnalysisComponent,
    HomeNewComponent,
    AmericanLawnComponent,
    NewHeaderComponent,
    NewFooterComponent,
    OurMethodComponent,
    OurIngredientsComponent,
    RegisterComponent,
    RegisterHeaderComponent,
    RegistrationStepComponent,
    CheckoutComponent,
    LawnAreaComponent,
    LineChartComponent,
    ProductPlanComponent,
    AboutYourLawnComponent,
    YourLawnComponent,
    SavePlanComponent,
    PrairieGuaranteeComponent,
    ContactUsComponent,
    LoginComponent,  
    ReferAFriendComponent,
    ThankYouComponent,
    MyAccountComponent,
    ResetPasswordComponent,
    ForgotPasswordComponent,
    WelcomeComponent,
    PreLaunchComponent,
    SuccessComponent,
    WelcomeHeaderComponent,
    WelcomeFooterComponent,
    RefersComponent,
    MilestoneWidgetComponent,
    ReferHeaderComponent,
    ReferFooterComponent,
    MyLawnComponent,
    RainChartComponent,
    GrassChartComponent,
    TempChartComponent,
    MoreQuestionsComponent,
    ProductComponent,
    CheckLawnComponent,
    ManualReviewComponent,
    ThankyouComponent,
    ChangePasswordComponent,
    EditProfileComponent,
    WelcomeBackComponent,
    AddLawnAddressComponent,
  ],
  imports: [
    BrowserModule,
    NgbModule.forRoot(),
    RouterModule.forRoot(appRoutes),
    BrowserAnimationsModule,
    ChartsModule,
    HttpModule,
    HttpClientModule,
    HttpClientJsonpModule,
    LoadingModule,
    FormsModule,
    GrowlModule,
    DropdownModule,
    DialogModule,
    ReactiveFormsModule,
    UIRouterModule.forRoot({ 
        states: [ 
            // homeState,
            // homeNewState,
            // lawnAnalysisState,
            // lawnAreaState,
            // lineChartState,
            // lawnViewState,
            // amLawnState,
            // ourMethodState,
            // ourIngredientsState,
            // registerState,
            // registrationStepState,
            // checkoutState,
            //productPlanState,
            //aboutYourLawnState,
            //yourLawnState
        ],
        // otherwise: '/home-new',
        // useHash: false 
    }),
  ],
  providers: [GoogleMapService, GoogleAnalyticsEventsService, GooglePlacesService, GoogleDrawingService, CustomHttpService, HttpService, DataService, FrontEndService, ApiService,ZillowService,UserService,FaqService, PaymentService, MailchimpsService],
  bootstrap: [AppComponent]
})
export class AppModule { }