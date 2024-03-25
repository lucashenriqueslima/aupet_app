import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { AppService } from 'src/app/services/app.service';
@Component({
	selector: 'app-criar-vistoria',
	templateUrl: './criar-vistoria.page.html',
	styleUrls: ['./criar-vistoria.page.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class CriarVistoriaPage implements OnInit {
	load = false;
	data: any = {};
	modelos = [];
	constructor(
		public navParams: NavParams,
		public appService: AppService,
		public modalCtrl: ModalController,
	) { }
	async ngOnInit() {
		this.data = Object.assign({}, this.navParams.data);
		delete this.data.modal;
		let res = await this.appService.httpGet(`proposta/vistoria/modelos`);
		this.modelos = res.modelos;
	}
	async salvar() {
		try {
			this.load = true;
			let res = await this.appService.httpPost(`proposta/criarVistoria`, this.data);
			this.appService.showToast('Vistoria criada com sucesso', 3000);
			this.modalCtrl.dismiss({ response: res });
		} catch (e) {
			this.appService.errorHandler(e);
		} finally {
			this.load = false;
		}
	}
	dismiss() {
		this.modalCtrl.dismiss();
	}
}