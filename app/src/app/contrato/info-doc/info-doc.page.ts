import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AppService } from 'src/app/services/app.service';
import { ActivatedRoute } from '@angular/router';
import ViaCep from 'node-viacep';
import { LoadingController } from '@ionic/angular';
@Component({
	selector: 'app-info-doc',
	templateUrl: './info-doc.page.html',
	styleUrls: ['./info-doc.page.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class InfoDocPage {
	public select = "";
	constructor(
		public route: ActivatedRoute,
		public appService: AppService,
		public loadingCtrl: LoadingController,
	) { }
	data = [];
	load = false;
	loading;
	async ngOnInit() {
		this.loading = await this.loadingCtrl.create({ message: 'Enviando informações ...' });
		this.data = await this.appService.httpGet('proposta/termo/variaveis/' + this.route.snapshot.params.id_pet);
	}
	async salvar() {
		try {
			await this.loading.present();
			await this.appService.httpPost(`proposta/termo/setvariables/${this.route.snapshot.params.id_pet}`, this.data);
			this.appService.events.contratoUpdate.emit();
			this.appService.showToast("Informações enviada com sucesso");
			window.history.back();
		} catch (e) {
			this.appService.errorHandler(e);
		} finally {
			this.loading.dismiss();
		}
	}
}