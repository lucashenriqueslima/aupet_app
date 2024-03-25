import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AppService } from 'src/app/services/app.service';
import { Router } from '@angular/router';
@Component({
	selector: 'app-home-consultor',
	templateUrl: './home-consultor.page.html',
	styleUrls: ['./home-consultor.page.scss'],
	encapsulation: ViewEncapsulation.None
})
export class HomeConsultorPage implements OnInit {
	foto;
	constructor(
		public appService: AppService,
		public router: Router
	) { }

	animate = false;
	ionViewDidEnter(){ this.animate = true; }
	
	ngOnInit() {
		this.foto = this.appService.user?.foto;
	}
	async logout() {
		this.appService.notAuth();
	}
}
