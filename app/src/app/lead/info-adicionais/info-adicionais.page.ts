import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NavParams } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { AppService } from 'src/app/services/app.service';
import ViaCep from 'node-viacep';
@Component({
	selector: 'app-info-adicionais',
	templateUrl: './info-adicionais.page.html',
	styleUrls: ['./info-adicionais.page.scss'],
	encapsulation: ViewEncapsulation.None
})
export class InfoAdicionaisPage implements OnInit {
	load = false;
	data: any = {};
	states = [];
	cities = [];
	viacep;
	constructor(
		public appService: AppService,
		public activatedRoute: ActivatedRoute,
	) { }
	async ngOnInit() {
		await this.getProposta();
		this.getStates();
	}
	async getStates() {
		this.appService.httpGetOffFirst(`getStates`).subscribe(states => this.states = states);
	}
	async selectState(id) {
		if (!id) return;
		this.appService.httpGetOffFirst(`getCities/${id}`).subscribe(data => {
			this.cities = data;
			if (this.viacep) this.data.id_cidade = this.cities.find(x => x.cidade == this.viacep.localidade).id;
		});
	}
	async cepKeyUp(evt) {
		evt.stopPropagation();
		let cep: string = evt.target.value && evt.target.value.match(/\d+/g).join("");
		if (cep.length > 7) {
			this.data.cep = cep.substring(0, 8);
			let viacep = new ViaCep({ type: 'json' });
			let address = viacep.zipCod.getZip(cep);
			address.then(data => data.json()).then(data => {
				if (data.erro) return;
				this.viacep = data;
				this.data.id_estado = this.states.find(x => x.uf == this.viacep.uf).id;
				this.data.bairro = this.viacep.bairro;
				this.data.rua = this.viacep.logradouro;
				this.data.complemento = this.viacep.complemento;
				this.selectState(this.data.id_estado);
			});
		}
	}
	async getProposta() {
		let res = await this.appService.httpGet(`proposta/dadosassociado/${this.activatedRoute.snapshot.params.id_lead}`);
		this.data = res.pessoa;
		if(this.data.data_nascimento){
			this.data.data_nascimento = new Date(this.data.data_nascimento);
			let nascimento = this.data.data_nascimento.toISOString().split('T');
			this.data.data_nascimento = nascimento[0];
		}
		this.selectState(this.data.id_estado);
	}
	async salvar() {
		try {
			this.load = true;
			await this.appService.httpPut('proposta/dadosAdicionais', this.data);
			this.appService.showToast('Dados alterados com sucesso', 3000);
			this.appService.events.upDetailLead.emit();
			window.history.back();
		} catch (e) {
			this.appService.errorHandler(e);
		} finally {
			this.load = false;
		}
	}
}