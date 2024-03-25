import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Location } from '@angular/common'
import { AppService } from 'src/app/services/app.service';
import ViaCep from 'node-viacep';
@Component({
	selector: 'app-perfil',
	templateUrl: './perfil.page.html',
	styleUrls: ['./perfil.page.scss'],
	encapsulation: ViewEncapsulation.None
})
export class PerfilPage implements OnInit {
	states = [];
	cities = [];
	viacep;
	data = {} as any;
	load = false;
	newFoto = false;
	associado: any;

	senha = 'password';
	nova_senha = 'password';
	confirmar_senha = 'password';


	constructor(
		private location: Location,
		public appService: AppService,
	) {
		this.associado = this.appService.user;
		this.getStates();
	}
	ngOnInit() {
		this.dataAlter();
		this.selectState(this.associado?.id_estado);
	}
	voltar() {
		this.location.back()
	}
	async logout() {
		this.appService.notAuth();
	}
	async getStates() {
		this.appService.httpGetOffFirst(`getStates`).subscribe(states => this.states = states);
	}
	async selectState(id) {
		if (!id) return;
		this.appService.httpGetOffFirst(`getCities/${id}`, 'hibrida').subscribe(data => {
			this.cities = data;
			if (this.viacep) this.associado.id_cidade = this.cities.find(x => x.cidade == this.viacep.localidade).id;
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
				this.viacep = data;
				this.data.id_estado = this.states.find(x => x.uf == this.viacep.uf).id;
				this.data.bairro = this.viacep.bairro;
				this.data.rua = this.viacep.logradouro;
				this.data.complemento = this.viacep.complemento;
				this.selectState(this.data.id_estado);
			});
		}
	}
	async inputfoto() {
		let dataURL = await this.appService.getImageBase();
		this.data.foto = dataURL;
		this.newFoto = true;
	}
	async dataAlter() {
		this.data = this.associado;
		if(this.data.data_nascimento){
			this.data.data_nascimento = new Date(this.data.data_nascimento);
			let nascimento = this.data.data_nascimento.toISOString().split('T');
			this.data.data_nascimento = nascimento[0];
		}
	}
	async request() {
		try {
			this.load = true;
			var reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
			if (!this.data.nome || !this.data.cpf || !this.data.telefone) throw 'Preencha os Dados do Associado';
			if (this.data.cpf.length < 14 || this.data.telefone.length < 15) {
				if (this.data.nome.length < 3)
					throw 'O tamanho mínimo do Nome é 3 caracteres.';
				else if (this.data.cpf.length < 14)
					throw 'Digite o Cpf completo.';
				else if (this.data.telefone.length < 14)
					throw 'Digite o Telefone/Whatsapp completo.';
			}
			if (!reg.test(this.data.email)) throw 'O E-mail digitado é inválido';
			// else if (!this.data.rua || !this.data.id_estado || !this.data.id_cidade || !this.data.numero || !this.data.bairro) throw 'Informe suas informações de endereço';
			if (this.data.novaSenha) {
				if (this.data.novaSenha != this.data.novaSenha2) throw 'Senhas divergentes';
			}
			let res = await this.appService.httpPost('associado/atualizar', this.data);
			this.appService.user = Object.assign(this.appService.user, { foto: res.pessoa.foto } , res.pessoa);
			this.appService.storage.set(`user`, this.appService.user);
			this.appService.showToast('Perfil alterado com sucesso', 10000);
			this.appService.navigateUrl(`${this.appService.ambiente}`);
		} catch (e) {
			this.appService.errorHandler(e);
		} finally {
			this.load = false;
		}
	}

	mudar_visibilidade(i) {
		if(i == 1){
			if (this.senha == 'password') {
				this.senha = 'text';
			} else {
				this.senha = 'password';
			}
		}
		if(i == 2){
			if (this.nova_senha == 'password') {
				this.nova_senha = 'text';
			} else {
				this.nova_senha = 'password';
			}
		}
		if(i == 3){
			if (this.confirmar_senha == 'password') {
				this.confirmar_senha = 'text';
			} else {
				this.confirmar_senha = 'password';
			}
		}
	}
}
