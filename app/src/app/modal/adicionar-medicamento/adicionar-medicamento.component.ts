import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { AppService } from 'src/app/services/app.service';
import { Keyboard } from '@awesome-cordova-plugins/keyboard/ngx';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
@Component({
	selector: 'app-adicionar-medicamento',
	templateUrl: './adicionar-medicamento.component.html',
	styleUrls: ['./adicionar-medicamento.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class AdicionarMedicamentoComponent implements OnInit {
	pet;
	tipo_tratamentos: [];
	data = {} as any;
	load;
	constructor(
		public modalCtrl: ModalController,
		public navParams: NavParams,
		public appService: AppService,
		public route: ActivatedRoute,
		public http: HttpClient,
	) { 
		this.pet = this.navParams.data.pet;
		this.data.id_pet = this.pet.id;

	}
	ngOnInit() {
		this.getTipoTratamentos();
	}
	async getTipoTratamentos() {
		await this.appService.httpGetOffFirst(`getTipoTratamentos/${this.pet.id_especie}`).subscribe(data => { this.tipo_tratamentos = data.tratamentos; }, this.appService.errorHandler);
	}
	async salvar() {
		try {
			this.load = true;
			if (!this.data.nome) throw "Informe o nome do Medicamento. ";
			else if (!this.data.dt_inicio) throw "Informe a Data de Inicio. ";
			else if (!this.data.hr_inicio) throw "Informa a Hora de Inicio. ";
			this.data.dt_inicio = `${this.data.dt_inicio}`;
			if (this.compareDates(this.data.validade)) throw 'Não é permitido usar data retroativa no campo válidade de medicamento!';
			let resp = await this.appService.httpPost('pet/adcionarMedicamento', this.data);
			if (resp) this.appService.showAlert(null, 'O Medicamento Foi Adcionado');
			this.modalCtrl.dismiss();
			this.appService.events.upAssocListMedicamentos.emit();
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
