import { AppService } from 'src/app/services/app.service';
import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@awesome-cordova-plugins/splash-screen/ngx';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';
import { MenuController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from './services/notification.service';
@Component({
	selector: 'app-root',
	templateUrl: 'app.component.html',
	styleUrls: ['app.component.scss'],
})
export class AppComponent {
	constructor(
		public http: HttpClient,
		public appService: AppService,
		private platform: Platform,
		private splashScreen: SplashScreen,
		private statusBar: StatusBar,
		public menuCtrl: MenuController,
		public notServ : NotificationService,
	) { }
	ngOnInit() {
		this.platform.ready().then(() => {
			this.statusBar.styleLightContent();
			this.splashScreen.hide();
		});
		setTimeout(() => this.notServ.init(), 1000);
	}
}