import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AppService } from 'src/app/services/app.service';
import { ActivatedRoute } from '@angular/router';
import ViaCep from 'node-viacep';

@Component({
  selector: 'app-dados-pagamento',
  templateUrl: './dados-pagamento.page.html',
  styleUrls: ['./dados-pagamento.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DadosPagamentoPage implements OnInit { 
  dados: any = {};
  states = [];
	cities = [];
	viacep;
  validate = true;

  constructor( 
    public appService: AppService,
		public route: ActivatedRoute, 
  ) { }

	ngOnInit() {
		this.getDadosAssociado();
		this.getStates();
	}

	async getDadosAssociado(){
		this.dados = this.appService.user;
		if(this.dados.data_nascimento){
			this.dados.data_nascimento = new Date(this.dados.data_nascimento);
			let nascimento = this.dados.data_nascimento.toISOString().split('T');
			this.dados.data_nascimento = nascimento[0];
		}
		this.selectState(this.dados.id_estado);
	}

	async getStates() {
		this.appService.httpGetOffFirst(`getStates`).subscribe(states => this.states = states);
	}

	async selectState(id) {
		if (!id) return;
		this.appService.httpGetOffFirst(`getCities/${id}`).subscribe(data => {
			this.cities = data;
			if (this.viacep) this.dados.id_cidade = this.cities.find(x => x.cidade == this.viacep.localidade).id;
		});
	}

	async navigatePagamento(){
		try {
			await this.appService.httpPost('associado/atualizar', this.dados);
			this.appService.navigateUrl(`${this.appService.ambiente}/cartao-pagamento/${this.route.snapshot.params.id_pet}/${this.route.snapshot.params.id_plano}`);

		} catch (error) {
			this.appService.errorHandler(error);		
		}
	}

	validateButton(){
		if(this.dados.forma_plano) this.validate = false;
	}

	async cepKeyUp(evt) {
		evt.stopPropagation();
		let cep: string = evt.target.value && evt.target.value.match(/\d+/g).join("");
		if (cep.length > 7) {
			this.dados.cep = cep.substring(0, 8);
			let viacep = new ViaCep({ type: 'json' });
			let address = viacep.zipCod.getZip(cep);
			address.then(data => data.json()).then(data => {
				this.viacep = data;
				this.dados.id_estado = this.states.find(x => x.uf == this.viacep.uf).id;
				this.dados.bairro = this.viacep.bairro;
				this.dados.rua = this.viacep.logradouro;
				this.dados.complemento = this.viacep.complemento;
				this.selectState(this.dados.id_estado);
			});
		}
	}
}
