import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from 'src/app/services/app.service';
import { Platform } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
@Component({
	selector: 'app-adicionar-pet',
	templateUrl: './adicionar-pet.page.html',
	styleUrls: ['./adicionar-pet.page.scss'],
	encapsulation: ViewEncapsulation.None
})
export class AdicionarPetPage {
	raca = [];
	especie = [];
	planos = [];
	data: any = {};
	load = false;
	constructor(
		public appService: AppService,
		public route: ActivatedRoute
	) {
		this.selectEspecies();
		this.selectPlanos();
	}
	ngOnInit() {
		if (this.route.snapshot.params.id) this.getPet();
		console.log(this.route.snapshot.params.id_plano);
	}
	selectRaca(id) {
		this.appService.httpGetOffFirst(`getRaca/${id}`).subscribe(data => {
			this.raca = data;
		});
	}
	async getPet() {
		this.data = await this.appService.httpGet('associado/getPet/' + this.route.snapshot.params.id);
		this.selectRaca(this.data.id_especie);
	}
	async selectEspecies() {
		this.especie = await this.appService.httpGet(`getEspecies`);
	}
	async selectPlanos() {
		this.planos = await this.appService.httpGet(`getPlanos`);
	}
	async inputfoto() {
		let dataURL = await this.appService.getImageBase();
		this.data.foto = dataURL;
	}
	async request() {
		try {
			this.load = true;
			var id_pet;
			if (!this.data.nome) throw 'O Nome do Pet é obrigatório';
			else if (!this.data.sexo) throw 'O Sexo do Pet é obrigatório';
			else if (!this.data.id_especie || !this.data.id_raca) throw 'O A Espécie e Raça do Pet é obrigatório';
			this.data.id_associado = this.appService.user.associado.id;
			this.data.status = 'ativo';
			if (!this.data.id) {
				let retorno = await this.appService.httpPost(`pet/adicionar`, this.data);
				id_pet = retorno.insertId;
			} else {
				let retorno = await this.appService.httpPut(`pet/atualizar`, this.data);
				id_pet = this.data.id;
			}
			this.appService.showToast('Realizado com sucesso', 5000);
			if(this.route.snapshot.params.id_plano) this.appService.navigateUrl(`${this.appService.ambiente}/plano/${this.route.snapshot.params.id_plano}/${id_pet}`);
			else this.appService.navigateUrl(`/associado/meus-pets/pet/${id_pet}`);
			this.appService.events.upAssciadoPetDetalhes.emit();
		} catch (e) {
			this.appService.errorHandler(e);
		} finally {
			this.load = false;
		}
	}
}
