import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController, NavParams } from '@ionic/angular';
import { AppService } from '../../services/app.service';
@Component({
	selector: 'app-adicionar-pet',
	templateUrl: './adicionar-pet.component.html',
	styleUrls: ['./adicionar-pet.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class AdicionarPetComponent implements OnInit {
	proposta;
	pet: any = {};
	raca = [];
	especie = [];
	planos = [];
	load;
	constructor(
		public modalCtrl: ModalController,
		public navParams: NavParams,
		public modalController: ModalController,
		public route: ActivatedRoute,
		public appService: AppService,
	) {
		this.selectEspecies();
		this.selectPlanos();
	}
	ngOnInit() {
		this.proposta = this.navParams.data.proposta;
		// console.log(this.proposta);
	}
	dismiss() {
		this.modalCtrl.dismiss({
			'dismissed': true
		});
	}
	selectRaca(id) {
		if(!id) return;
		this.appService.httpGetOffFirst(`getRaca/${id}`, 'hibrida').subscribe(data => {
			this.raca = data;
		});
	}
	async selectEspecies() {
		this.especie = await this.appService.httpGet(`getEspecies`);
	}
	async selectPlanos() {
		this.planos = await this.appService.httpGet(`getPlanos`);
	}
	async salvar() {
		try {
			this.load = true;
			if (!this.pet.nome) this.appService.showAlert(null, 'Informe o nome do Pet.');
			else if (!this.pet.id_especie) this.appService.showAlert(null, 'Informe a Especie');
			else if (!this.pet.sexo) this.appService.showAlert(null, 'informe o Sexo');
			else if (!this.pet.id_plano) this.appService.showAlert(null, 'informe o plano');
			this.pet.id_proposta = this.proposta.id;
			let resp = await this.appService.httpPost('proposta/addPet', this.pet);
			this.modalCtrl.dismiss();
			this.appService.events.upDetailLead.emit();
		} catch (e) {
			this.appService.errorHandler(e);
		} finally {
			this.load = false;
		}
	}
}
