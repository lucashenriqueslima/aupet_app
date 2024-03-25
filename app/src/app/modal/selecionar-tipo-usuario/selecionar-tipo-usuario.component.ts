import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { Router } from '@angular/router';
import { AppService } from './../../services/app.service';
@Component({
	selector: 'app-selecionar-tipo-usuario',
	templateUrl: './selecionar-tipo-usuario.component.html',
	styleUrls: ['./selecionar-tipo-usuario.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class SelecionarTipoUsuarioComponent implements OnInit {
	// inputValue: string = "";
	public tipo_user: any;
	data: any = {};
	tipo: any = {};
	tipo_usuario = 0;
	load = false;
	User;
	constructor(
		public appService: AppService,
		public modalCtrl: ModalController,
		private router: Router,
		public navParams: NavParams,
	) { }
	ngOnInit() {
		this.data = this.navParams.data?.login?.data;
	}
	dismiss() {
		this.modalCtrl.dismiss();
	}
	async mudar_pagina() {
		var elements = document.getElementsByName('tipo_user');
		elements.forEach(e => {
			if (e['checked']) {
				if (e['defaultValue'] == 1) {
					// this.tipo.endpoint = 'associado/login';
					this.tipo.ambiente = 'associado';
					this.tipo.url = '/associado';
				}
				if (e['defaultValue'] == 2) {
					// this.tipo.endpoint = 'consultant/login';
					this.tipo.ambiente = 'consultor';
					this.tipo.url = '/consultor';
				}
				if (e['defaultValue'] == 3) {
					// this.tipo.endpoint = 'credenciada/login';
					this.tipo.ambiente = 'clinica';
					this.tipo.url = '/clinica';
				}
			}
		});
		this.modalCtrl.dismiss(this.tipo);
	}
}