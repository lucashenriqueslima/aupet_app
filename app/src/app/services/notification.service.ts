import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { AppService } from './app.service';
import { AngularFireMessaging } from '@angular/fire/compat/messaging';
import { Push, PushObject, PushOptions } from '@awesome-cordova-plugins/push/ngx';
import { SwUpdate, SwPush } from '@angular/service-worker';
@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    constructor(
        public platform: Platform,
        public appService: AppService,
        private afMessaging: AngularFireMessaging,
        private push: Push,
        private sWupdates: SwUpdate,
        private sWpush: SwPush,
    ) { }
    public init() {
        const options: PushOptions = { android: { topics: ['Geral'], forceShow: true }, ios: { alert: 'true', badge: true, sound: 'false' }, windows: {}, browser: { pushServiceURL: 'http://push.api.phonegap.com/v1/push' } };
        this.pushObject = this.push.init(options);
        this.pushObject.on('notification').subscribe((notification: any) => {
            if (notification.additionalData.url) location.href = notification.additionalData.url;
        });
        this.pushObject.on('error').subscribe(error => console.error('Error with Push plugin', error));
        this.pushObject.on('registration').subscribe((registration: any) => {
            this.token = registration.registrationId;
        });
    }
    token = '';
    pushObject: PushObject;
    swRegistration: any;
    permissionGranted: any = null;
    private async saveToken(token: any) {
        if (!token) return;
        this.permissionGranted = true;
        let plataforma = this.appService.platform.is('cordova') ? 'app' : 'web';
        await this.appService.httpPost('savePNT', { 'token': token, 'plataforma': plataforma });
    }
    public async getToken() {
        if (this.appService.platform.is('cordova')) {
            if (!this.token) await this.init();
            this.saveToken(this.token)
        } else {
            if (Notification.permission == 'granted')
                this.afMessaging.getToken.subscribe((token) => this.saveToken(token), (error) => { console.error(error); });
            else
                this.afMessaging.requestToken.subscribe((token) => this.saveToken(token), (error) => { console.error(error); });
        }
    }
    public async statusPermissao() {
        if (this.appService.platform.is('cordova')) {
            let res = await this.push.hasPermission();
            this.permissionGranted = res.isEnabled;
        } else {
            this.permissionGranted = Notification.permission == 'granted';
        }
        if (this.permissionGranted) this.getToken();
    }
}