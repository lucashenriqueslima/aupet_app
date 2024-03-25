import { Location } from '@angular/common'
import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Platform } from '@ionic/angular';
import { AppService } from 'src/app/services/app.service';
import ViaCep from 'node-viacep';
import { NotificationService } from 'src/app/services/notification.service';
import { ActivatedRoute } from '@angular/router';

@Component({
	selector: 'app-criar-usuario',
	templateUrl: './criar-usuario.page.html',
	styleUrls: ['./criar-usuario.page.scss'],
	encapsulation: ViewEncapsulation.None
})
export class CriarUsuarioPage {
	states = [];
	cities = [];
	viacep;
	form = {} as any;
	load = false;
	senha = 'password';
	confirmar_senha = 'password';

	@ViewChild('autofocus', { static: false }) autofocus;
	constructor(
		private location: Location,
		public appService: AppService,
		private platform: Platform,
		public notServ: NotificationService,
		public route: ActivatedRoute,
	) {
		this.getStates();
	}
	async ngOnInit() {
		this.form.id_estado = '';
		this.form.id_cidade = '';
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
	async request(evt) {
		try {
			evt.preventDefault();

			this.load = true;
			var reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
			if (!this.form.nome || !this.form.cpf || !this.form.telefone) throw 'Insira os Dados do Usuario';
			if (this.form.nome.length < 3) throw 'O tamanho mínimo do Nome é 3 caracteres.';
			else if (this.form.cpf.length < 14) throw 'Digite o Cpf completo.';
			else if(!this.appService.validaCPF(this.form.cpf)) throw 'Informe um CPF válido';
			else if (!reg.test(this.form.email)) throw 'O E-mail digitado é inválido';
			else if (this.form.telefone.length < 14) throw 'Digite o Telefone/Whatsapp completo.';

			else if (!this.form.rua) throw 'Informe o seu logradouro';
			else if (!this.form.id_estado) throw 'Informe o seu estado';
			else if (!this.form.id_cidade) throw 'Informe a sua cidade';
			else if (!this.form.bairro) throw 'Informe o seu bairro';	

			else if (!this.form.senha) throw 'Digite a senha';
			else if (!this.form.passrepeat) throw 'Digite a confirmação de senha';
			else if (this.form.senha != this.form.passrepeat) throw 'Senhas divergentes';
			
			let res = await this.appService.httpPost('associado/novo', this.form);
			await this.appService.storage.set(`user`, res.data);
			this.appService.user = res.data;
			await this.appService.storage.set(`access_token`, res.token);
			this.notServ.statusPermissao();
			this.notServ.getToken();
			this.appService.showToast(`Olá ${this.form.nome}, Seja bem vindo ao Aupet`);
			
			if(this.route.snapshot.params.id_plano) this.appService.navigateUrl(`/associado/meus-pets/adicionar-pet/${this.route.snapshot.params.id_plano}`);
			else this.appService.navigateUrl("/associado");
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