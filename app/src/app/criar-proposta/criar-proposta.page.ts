import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { AppService } from 'src/app/services/app.service';
import { VerificaExisteAssociadoComponent } from './../modal/verifica-existe-associado/verifica-existe-associado.component';
@Component({
	selector: 'app-criar-proposta',
	templateUrl: './criar-proposta.page.html',
	styleUrls: ['./criar-proposta.page.scss'],
	encapsulation: ViewEncapsulation.None
})
export class CriarPropostaPage {
	constructor(
		public appService: AppService,
		public router: Router,
		public modalController: ModalController
	) { }
	data: any = {};
	pets = [];
	contador = 0;
	raca = [];
	especie = [];
	planos = [];
	load;
	async ngOnInit() {
		this.selectEspecies();
		this.selectPlanos();
		this.pets[0] = { ex: 0 };
		this.contador = 1;
	}
	async cadastra_proposta() {
		try {
			this.load = true;
			var response;
			var reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
			if ((this.data.nome?.length || 0) < 3) throw 'O tamanho mínimo do Nome é 3 caracteres.';
			else if ((this.data.telefone?.length || 0) < 14) throw 'Digite o Telefone/Whatsapp completo.';
			else if (!reg.test(this.data.email)) throw 'O E-mail digitado é inválido';
			this.checkPets();
			let associado = await this.appService.httpGet(`proposta/verificaExisteAssociado/${this.data.email}`);

			if(associado){ 
				const modal = await this.modalController.create({ component: VerificaExisteAssociadoComponent, componentProps: { associado: associado.associado }, });
				await modal.present();
				let confirm = (await modal.onDidDismiss()).data; 
				if(confirm?.dismissed) return;
			}

			if (this.appService.ambiente == "consultor") {
				delete this.data.id_clinica;
				this.data.id_consultor = this.appService.user.consultor.id;
				this.data.indicador = "consultor";
				this.data.pets = this.pets;
				response = await this.appService.httpPost('proposta/criar', this.data);
			} else if (this.appService.ambiente == "clinica") {
				delete this.data.id_consultor;
				this.data.id_clinica = this.appService.user.clinica.id;
				this.data.indicador = "clinica";
				this.data.pets = this.pets;
				response = await this.appService.httpPost('proposta/criar', this.data);
			} else {
				throw new Error("Ambiente não encontrado");
			}
			this.appService.navigateUrl(`/${this.appService.ambiente}/proposta/${response.id}`);
		} catch (e) {
			this.appService.errorHandler(e);
		} finally {
			this.load = false;
		}
	}
	checkPets() {
		this.pets.forEach(x => {
			if (!x.nome) throw `Informe o nome do pet`;
			else if (!x.id_especie) throw `Informe a especie do(a) ${x.nome}`;
			else if (!x.id_raca) throw `Informe a raça do(a) ${x.nome}`;
			else if (!x.id_plano) throw `Informe o plano do(a) ${x.nome}`;
		})
	}
	addPet() {
		this.pets.push({});
	}
	removePet(i) {
		if(i === 0) return;
		this.pets.splice(i, 1);
	}
	selectRaca(id) {
		this.appService.httpGetOffFirst(`getRaca/${id}`).subscribe(data => {
			this.raca = data;
		});
	}
	async selectEspecies() {
		this.especie = await this.appService.httpGet(`getEspecies`);
	}
	async selectPlanos() {
		this.planos = await this.appService.httpGet(`proposta/planos`);
	}

	async open_modal_verifica_associado() {
		const modal = await this.modalController.create({
			component: VerificaExisteAssociadoComponent,
			componentProps: { },
		});
		return await modal.present();
	}
}