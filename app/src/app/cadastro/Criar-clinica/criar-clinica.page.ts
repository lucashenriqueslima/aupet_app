import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SelecionarEspecialidadeComponent } from './../../modal/selecionar-especialidade/selecionar-especialidade.component';
import { Platform } from '@ionic/angular';
import { AppService } from 'src/app/services/app.service';
import ViaCep from 'node-viacep';
@Component({
	selector: 'app-criar-clinica',
	templateUrl: './criar-clinica.page.html',
	styleUrls: ['./criar-clinica.page.scss'],
	encapsulation: ViewEncapsulation.None
})
export class CriarClinicaPage {
	especialidades: any = [];
	states = [];
	cities = [];
	form = {} as any;
	viacep;
	images = ['', '', '', '', '', '',] as any;
	load = false;
	senha = 'password';
	confirmar_senha = 'password';
	location;

	constructor(
		public appService: AppService,
		public modalController: ModalController
	) { }
	async ngOnInit() {
		this.form.id_estado = '';
		this.form.id_cidade = '';
		this.getStates();
		this.getEspecialidades();
		await this.obterLocalização();
	}
	async open_modal_especialidade() {
		const modal = await this.modalController.create({
			component: SelecionarEspecialidadeComponent,
			componentProps: { especialidades: this.especialidades },
		});
		await modal.present();
	}
	async getEspecialidades() {
		this.appService.httpGetOffFirst(`getEspecialidades`).subscribe(data => this.especialidades = data);
	}
	async getStates() {
		this.appService.httpGetOffFirst(`getStates`).subscribe(states => this.states = states);
	}
	selectState(id) {
		if (!id) return;
		this.appService.httpGetOffFirst(`getCities/${id}`,).subscribe(data => {
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
	async clickfile(prop) {
		let dataURL = await this.appService.getImageBase();
		this[prop] = this.appService.sanitazeResourceImg(dataURL);
		this.images[prop] = dataURL;
	}
	async inputFoto() {
		let dataURL = await this.appService.getImageBase();
		this.form.logo = dataURL;
	}
	async getImages(i) {
		let dataURL = await this.appService.getImageBase();
		this.images[i] = dataURL;
	}
	async request(evt) {
		try {
			evt.preventDefault();
			this.load = true;
			var reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
			if (!this.form.nome) throw 'Preencha os Campos obrigatorios';
			if (this.form.nome.length < 3) throw 'O tamanho mínimo do Nome é 3 caracteres.';
			// else if (this.form.cnpj.length < 17) throw 'Digite o CNPJ completo.';
			else if (!this.appService.validaCNPJ(this.form.cnpj)) throw 'Informe um CNPJ válido!';
			else if (this.form.telefone.length < 14) throw 'Digite o Telefone/Whatsapp completo.';
			if (this.form.responsavel == null) throw 'Obrigatorio Pelo menos 1 Responsavel';
			else if (!this.form.logo) throw 'A logo é obrigatório';
			else if (!reg.test(this.form.email)) throw 'O E-mail digitado é inválido';
			else if (this.form.email2 != null && !reg.test(this.form.email2)) throw 'O Segundo E-mail digitado é inválido';
			else if (!this.form.rua) throw 'Informe o seu logradouro';
			else if (!this.form.id_estado) throw 'Informe o seu estado';
			else if (!this.form.id_cidade) throw 'Informe a sua cidade';
			else if (!this.form.bairro) throw 'Informe o seu bairro';	
			else if (!this.form.senha) throw 'Digite a senha';
			else if (!this.form.passrepeat) throw 'Digite a confirmação de senha';
			else if (this.form.senha != this.form.passrepeat) throw 'Senhas divergentes';
			this.form.images = this.images;
			this.form.especialidades = this.especialidades.filter(x => x.selecionado);
			await this.appService.httpPost('clinica/criar', this.form);
			this.appService.navigateUrl('/cadastro-concluido/clinica');
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

	filterEspecialidades = (row) => row.selecionado;
	checkEsp = () => this.especialidades.some(x => x.selecionado);

	async obterLocalização() {
		this.location = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject));
		this.form.latitude = this.location.coords.latitude;
		this.form.longitude = this.location.coords.longitude;
	}
}