import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { AppService } from 'src/app/services/app.service';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
@Component({
	selector: 'app-adicionar-vermifugo',
	templateUrl: './adicionar-vermifugo.component.html',
	styleUrls: ['./adicionar-vermifugo.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class AdicionarVermifugoComponent implements OnInit {
	pet;
	data: any = {};
	load;
	constructor(
		public modalCtrl: ModalController,
		public navParams: NavParams,
		public appService: AppService,
		public route: ActivatedRoute,
		public http: HttpClient,
	) { }
	ngOnInit() { this.pet = this.navParams.data.pet; }
	async salvar() {
		try {
			this.load = true;
			this.data.id_pet = this.pet.id;
			this.data.data_vermifungo = `${this.data.data} ${this.data.hr_fermifungo}`;
			if (!this.data.nome_vermifungo) throw 'Informe o Nome do Vermifungo';
			else if (!this.data.data_vermifungo) throw 'Informe a Data da Aplicação do Vermifungo';
			else if (!this.compareDates(this.data.data_vermifungo)) throw 'Verifique A Data da Aplicação do Vermifungo';
			else if (!this.data.proxima_data) throw 'Informe a Data da Próxima Aplicação do Vermifungo';
			else if (!this.compareNextDates(this.data.proxima_data)) throw 'Verifique A Data da Próxima Aplicação do Vermifungo';
			else var resp = await this.appService.httpPost('pet/adicionarVermifungo', this.data);
			if (resp) {
				this.appService.showToast('O Vermifungo Foi Adicionado');
				this.modalCtrl.dismiss();
				this.appService.events.upAssocVermList.emit();
			}
		} catch (e) {
			this.appService.errorHandler(e);
		} finally {
			this.load = false;
		}
	}
	compareDates(date) {
		// let parts = date.split('-') // separa a data pelo caracter '-'
		let today = new Date()      // pega a data atual
		date = new Date(date) // formata 'date'
		return date <= today ? true : false
	}
	compareNextDates(date) {
		let parts = date.split('-') // separa a data pelo caracter '-'
		let today = new Date()      // pega a data atual
		date = new Date(date) // formata 'date'
		return date >= today ? true : false
	}
	dismiss() {
		this.modalCtrl.dismiss({
			'dismissed': true
		});
	}
}
