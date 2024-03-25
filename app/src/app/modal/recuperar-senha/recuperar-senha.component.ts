import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AppService } from 'src/app/services/app.service';
@Component({
	selector: 'app-recuperar-senha',
	templateUrl: './recuperar-senha.component.html',
	styleUrls: ['./recuperar-senha.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class RecuperarSenhaComponent {
	load = false;
	data: any = {};
	constructor(
		public modalCtrl: ModalController,
		public appService: AppService,
		public modalController: ModalController,
	) { }
	async salvar(evt) {
		try {
			evt.preventDefault();
			this.load = true;
			await this.appService.httpPost(`esqueciSenha`, this.data);
			await this.appService.showAlert("Sucesso", "Foi enviado um email com um link para alteração da sua senha.");
			this.dismiss();
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