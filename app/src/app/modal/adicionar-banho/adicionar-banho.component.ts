import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { AppService } from 'src/app/services/app.service';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
@Component({
	selector: 'app-adicionar-banho',
	templateUrl: './adicionar-banho.component.html',
	styleUrls: ['./adicionar-banho.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class AdicionarBanhoComponent implements OnInit {
	pet;
	clinicas;
	data: any = {};
	load;
	constructor(
		public modalCtrl: ModalController,
		public navParams: NavParams,
		public appService: AppService,
		public route: ActivatedRoute,
		public http: HttpClient,
	) { }
	ngOnInit() { this.pet = this.navParams.data.pet; this.clinicas = this.navParams.data.clinicas; }
	async salvar() {
		try {
			this.load = true;
			this.data.id_pet = this.pet.id;
			if (!this.data.data_banho) throw 'Informe a Data';
			else if (!this.compareDates(this.data.data_banho)) throw 'Verifique A Data do Banho';
			else var resp = await this.appService.httpPost('pet/adicionarBanho', this.data);
			if (resp) {
				this.appService.showToast('O Banho Foi Adicionado');
				this.modalCtrl.dismiss();
				this.appService.events.upAssocBanhoList.emit();
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
	dismiss() {
		this.modalCtrl.dismiss({
			'dismissed': true
		});
	}
}
