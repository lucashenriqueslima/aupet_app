import { NgModule } from '@angular/core';
import { SplashScreen } from '@awesome-cordova-plugins/splash-screen/ngx';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';
import { Diagnostic } from '@awesome-cordova-plugins/diagnostic/ngx';
import { Keyboard } from '@awesome-cordova-plugins/keyboard/ngx';
import { Camera } from '@awesome-cordova-plugins/camera/ngx';
// import { Contacts } from '@awesome-cordova-plugins/contacts/ngx';
import { Push } from '@awesome-cordova-plugins/push/ngx';
@NgModule({
	providers: [
		SplashScreen,
		StatusBar,
		SocialSharing,
		File,
		Geolocation,
		Diagnostic,
		Keyboard,
		Camera,
		// Contacts,
		Push
	]
})
export class IonicNativeModule { }