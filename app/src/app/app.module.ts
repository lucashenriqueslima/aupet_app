import { NgModule, LOCALE_ID } from '@angular/core';
import { HashLocationStrategy, LocationStrategy, registerLocaleData } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicStorageModule } from '@ionic/storage';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@awesome-cordova-plugins/splash-screen/ngx';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { AppService, Events } from './services/app.service';
import { HttpsRequestInterceptor } from './services/intercept.service';
import { ConsultantGuard, AssociadoGuard, CredenciadaGuard } from './guards';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import localePt from '@angular/common/locales/pt';
import localePtExtra from '@angular/common/locales/extra/pt';
registerLocaleData(localePt, 'pt-BR', localePtExtra);
import * as Sentry from "@sentry/browser";
import { IonicNativeModule } from 'src/ionic-native/ionic-native.module';

// import { AngularFireModule } from '@angular/fire';
// import { AngularFireMessagingModule } from '@angular/fire/messaging';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireMessagingModule } from '@angular/fire/compat/messaging';

import { NgxMercadopagoModule } from 'ngx-mercadopago';

//import { Facebook } from '@awesome-cordova-plugins/facebook/ngx';
// console.log(localStorage.getItem('PUBLIC_KEY'));
@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    NgxMercadopagoModule.forRoot({
      publishKey: localStorage.getItem('PUBLIC_KEY'),
      pathSDK: "https://secure.mlstatic.com/sdk/javascript/v1/mercadopago.js"
    }),
    IonicModule.forRoot(),
    IonicStorageModule.forRoot({ name: 'ileva', driverOrder: ['sqlite', 'indexeddb', 'websql'] }),
    AppRoutingModule,
    HttpClientModule,
    RouterModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production, scope: '/', registrationStrategy: "registerImmediately" }),
    IonicNativeModule,
    AngularFireModule.initializeApp(environment.firebase),
    provideFirebaseApp(() => {
      const app = initializeApp(environment.firebase);
      return app;
    }),
    AngularFireMessagingModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: HttpsRequestInterceptor, multi: true },
    AppService, Events,
    StatusBar,
    SplashScreen,
    // Facebook,
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    ConsultantGuard, AssociadoGuard, CredenciadaGuard,
    { provide: LOCALE_ID, useValue: "pt-BR" }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(
    public appService: AppService,
  ) { }
}
