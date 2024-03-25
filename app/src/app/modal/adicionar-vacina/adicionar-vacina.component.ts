import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { AppService } from 'src/app/services/app.service';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
@Component({
	selector: 'app-adicionar-vacina',
	templateUrl: './adicionar-vacina.component.html',
	styleUrls: ['./adicionar-vacina.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class AdicionarVacinaComponent implements OnInit {
	pet;
	clinicas;
	data: any = {};
	load;
	clinica;
	today: string = (new Date).toISOString().substr(0, 10);
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
			if (!this.data.nome_vacina) throw "Informe o Nome da Vacinação. ";
			else if (!this.data.data_vacina) throw "Informe a Data da Vacinação. ";
			else if (!this.data.data_revacina) throw "Informe a Data da Próxima Vacinação. ";
			else if (this.compareNextDates(this.data.data_vacina, this.data.data_revacina)) throw "Verifique A Data da Próxima Vacinação. ";
			else var resp = await this.appService.httpPost('pet/adicionarVacina', this.data);
			if (resp.insertId) {
				await this.appService.showToast('Foi solicitado o Agendamento Aguarde a Confirmação da Clinica.', 10000);
				this.modalCtrl.dismiss();
				this.appService.events.upAssocVacinaList.emit();
			}
		} catch (e) {
			this.appService.errorHandler(e);
		} finally {
			this.load = false;
		}
	}
	async selecionarClinica(id) {
		this.clinica = this.clinicas.find(item => item.id_clinica == id);
		this.data.nome_clinica = this.clinica.nome_fantasia;
		this.data.id_especialidade = 4;
		// console.log(this.clinica);
	}
	compareDates(date) {
		let today = new Date()      // pega a data atual
		date = new Date(date) // formata 'date'
		return date >= today ? true : false
	}
	compareNextDates(date, date2) {
		date = new Date(date)
		date2 = new Date(date2) // formata 'date'
		return date > date2 ? true : false
	}
	dismiss() {
		this.modalCtrl.dismiss({
			'dismissed': true
		});
	}
}
