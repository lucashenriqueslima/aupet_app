import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { AppService } from 'src/app/services/app.service';
import { Keyboard } from '@awesome-cordova-plugins/keyboard/ngx';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
@Component({
	selector: 'app-adicionar-exame',
	templateUrl: './adicionar-exame.component.html',
	styleUrls: ['./adicionar-exame.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class AdicionarExameComponent implements OnInit {
	pet;
	clinicas;
	data = {} as any;
	clinica;
	load;
	today: string = (new Date).toISOString().substr(0, 10);
	constructor(
		public modalCtrl: ModalController,
		public navParams: NavParams,
		public appService: AppService,
		public route: ActivatedRoute,
		public http: HttpClient,
	) { }
	ngOnInit() {
		this.pet = this.navParams.data.pet;
		this.clinicas = this.navParams.data.clinicas;
	}
	dismiss() {
		this.modalCtrl.dismiss({
			'dismissed': true
		});
	}
	async salvar() {
		try {
			this.load = true;
			if (!this.data.nome) throw "Informe o nome do Exame. ";
			else if (!this.data.data) throw "Informe a Data.";
			else if (!this.data.hora) throw "Informa a Hora.";
			this.data.id_pet = this.pet.id;
			this.data.data = `${this.data.data} ${this.data.hora}`;
			let resp = await this.appService.httpPost('pet/adcionarExame', this.data);
			if (resp) {
				await this.appService.showSuccess(null, 'Foi solicitado o Agendamento Aguarde a Confirmação da Clinica.');
				this.modalCtrl.dismiss();
				this.appService.events.upAssocListExame.emit();
			}
		} catch (e) {
			this.appService.errorHandler(e);
		} finally {
			this.load = false;
		}
	}
	compareDates(date) {
		let parts = date.split('-') // separa a data pelo caracter '-'
		let today = new Date()      // pega a data atual
		date = new Date(date) // formata 'date'
		return date <= today ? true : false
	}
	async selecionarClinica(id) {
		this.clinica = this.clinicas.find(item => item.id_clinica == id);
		this.data.clinica = this.clinica.nome_fantasia;
		this.clinica.especialidades = this.clinica.especialidades.filter(item => item.id == 3 || item.id == 10);
	}
}
