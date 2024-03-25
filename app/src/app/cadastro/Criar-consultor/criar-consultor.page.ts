import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Platform } from '@ionic/angular';
import { AppService } from 'src/app/services/app.service';
import ViaCep from 'node-viacep';
@Component({
	selector: 'app-criar-consultor',
	templateUrl: './criar-consultor.page.html',
	styleUrls: ['./criar-consultor.page.scss'],
	encapsulation: ViewEncapsulation.None
})
export class CriarConsultorPage {
	constructor(
		public appService: AppService,
		private platform: Platform,
	) { }
	states = [];
	cities = [];
	viacep;
	equipes = [];
	form = {} as any;
	load = false;
	senha = 'password';
	confirmar_senha = 'password';
	
	@ViewChild('autofocus', { static: false }) autofocus;
	async ngOnInit() {
		this.form.id_estado = '';
		this.form.id_cidade = '';
		this.form.id_equipe = '';
		this.getStates();
		this.appService.httpGetOffFirst(`consultor/equipes`).subscribe(res => this.equipes = res.equipes);
	}
	async getStates() {
		this.appService.httpGetOffFirst(`getStates`).subscribe(states => this.states = states);
	}

	async selectState(id) {
		this.appService.httpGetOffFirst(`getCities/${id || 0}`, 'hibrida').subscribe(data => {
			this.cities = data;
			if (this.viacep) this.form.id_cidade = this.cities.find(x => x.cidade == this.viacep.localidade).id;
		});
	}
	async cepKeyUp(evt) {
		evt.stopPropagation();
		let cep: string = evt.target.value && evt.target.value.match(/\d+/g).join("");
		if (cep.length > 7) {
			this.form.cep = cep.substring(0, 8);
			let viacep = new ViaCep({ type: 'json' });
			let address = viacep.zipCod.getZip(cep);
			address.then(data => data.json()).then(data => {
				this.viacep = data;
				this.form.id_estado = this.states.find(x => x.uf == this.viacep.uf).id;
				this.form.bairro = this.viacep.bairro;
				this.form.rua = this.viacep.logradouro;
				this.form.complemento = this.viacep.complemento;
				this.selectState(this.form.id_estado);
			});
		}
	}
	async inputfoto() {
		let dataURL = await this.appService.getImageBase();
		this.form.foto = dataURL;
	}
	async inputRgFrente() {
		let dataURL = await this.appService.getImageBase();
		this.form.rg_frente = dataURL;
	}
	async inputRgVerso() {
		let dataURL = await this.appService.getImageBase();
		this.form.rg_verso = dataURL;
	}
	async inputCnhFrente() {
		let dataURL = await this.appService.getImageBase();
		this.form.cnh_frente = dataURL;
	}
	async inputCnhVerso() {
		let dataURL = await this.appService.getImageBase();
		this.form.cnh_verso = dataURL;
	}
	async request(evt) {
		try {
			evt.preventDefault();
			this.load = true;
			var reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
			if (!this.form.nome || !this.form.cpf || !this.form.telefone) throw 'Preencha os Dados do Consultor (Nome, CPF e/ou telefone)';
			if (this.form.cpf.length < 14 || this.form.telefone.length < 15 || this.form.telefone2 != null && this.form.telefone2.length < 14) {
				if (this.form.nome.length < 3) { throw 'O tamanho mínimo do Nome é 3 caracteres.'; } 
				else if (this.form.cpf.length < 14) { throw 'Digite o Cpf completo.'; } 
				else if(!this.appService.validaCPF(this.form.cpf)) { throw 'Informe um CPF válido'; }
				else if (this.form.telefone.length < 14) { throw 'Digite o Telefone/Whatsapp completo.'; } 
			}
			if(!this.form.rg_frente || !this.form.rg_verso || !this.form.cnh_frente || !this.form.cnh_verso ){
					if(!this.form.rg_frente){ throw 'Esta Faltando a Foto do RG frente.'; }
					else if(!this.form.rg_verso){ throw 'Esta Faltando a Foto do RG Verso.'; }
					else if(!this.form.cnh_frente){ throw 'Esta Faltando a Foto do CNH frente.'; }
					else if(!this.form.cnh_verso){ throw 'Esta Faltando a Foto do CNH Verso.'; }
			}
			if (!this.form.foto) throw 'A Foto de Perfil é obrigatório';
			else if (!reg.test(this.form.email)) throw 'O E-mail digitado é inválido';
			else if (this.form.segundo_email != null && !reg.test(this.form.segundo_email)) throw 'O Segundo E-mail digitado é inválido';
			// else if (!this.form.rua || !this.form.id_estado || !this.form.id_cidade || !this.form.numero || !this.form.bairro) throw 'Digite as Informações de Localização';
			else if (!this.form.rua) throw 'Informe o seu logradouro';
			else if (!this.form.id_estado) throw 'Informe o seu estado';
			else if (!this.form.id_cidade) throw 'Informe a sua cidade';
			else if (!this.form.bairro) throw 'Informe o seu bairro';			
			else if (!this.form.senha) throw 'Digite a senha';
			else if (!this.form.passrepeat) throw 'Digite a confirmação de senha';
			else if (this.form.senha != this.form.passrepeat) throw 'Senhas divergentes';
			await this.appService.httpPost('consultor/cadastroexterno', this.form);
			this.appService.showToast('Cadastrado com sucesso!');
			this.appService.navigateUrl('/cadastro-concluido/consultor');
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
		else{
			if (this.confirmar_senha == 'password') {
				this.confirmar_senha = 'text';
			} else {
				this.confirmar_senha = 'password';
			}
		}
	}
}