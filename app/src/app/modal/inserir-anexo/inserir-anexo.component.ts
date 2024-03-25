import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';
import { AppService } from 'src/app/services/app.service';
@Component({
	selector: 'app-inserir-anexo',
	templateUrl: './inserir-anexo.component.html',
	styleUrls: ['./inserir-anexo.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class InserirAnexoComponent {
	constructor(
		public navParams: NavParams,
		public appService: AppService,
		public modalCtrl: ModalController,
	) { }
	load = false;
	data: any = {};
	async salvarAnexo() {
		try {
			this.load = true;
			if (!this.data.anexo) throw "Selecione um arquivo";
			else if (!this.data.descricao) throw "Informe uma descrição";
			this.modalCtrl.dismiss(this.data);
		} catch (e) {
			this.appService.errorHandler(e);
		} finally {
			this.load = false;
		}
	}

	async selecionarAnexo() {
		let file = await this.appService.getFilePhone();
		this.data.anexo = file.blob;
		this.data.nameFile = file.name;
	}
}
