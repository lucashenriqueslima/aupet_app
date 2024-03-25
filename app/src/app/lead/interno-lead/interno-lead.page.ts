import { Component, EventEmitter, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { AppService } from 'src/app/services/app.service';
import { AlterarDadosClienteComponent } from './../../modal/alterar-dados-cliente/alterar-dados-cliente.component';
import { AdicionarPetComponent } from './../../modal/adicionar-pet/adicionar-pet.component';
import { ExcluirPropostaComponent } from './../../modal/excluir-proposta/excluir-proposta.component';
import { finalize } from 'rxjs/operators';
@Component({
	selector: 'app-interno-lead',
	templateUrl: './interno-lead.page.html',
	styleUrls: ['./interno-lead.page.scss'],
	encapsulation: ViewEncapsulation.None
})
export class InternoLeadPage {
	data: any = {};
	params: any = {};
	form: any = {};
	pets: any[] = [];
	assinatura;
	constructor(
		public modalController: ModalController,
		public route: ActivatedRoute,
		public appService: AppService,
		private actionSheetCrtl: ActionSheetController,
	) { }
	subscribe;
	ngOnInit() {
		this.subscribe = this.appService.events.upDetailLead.subscribe(() => this.getData());
		this.getData();
	}
	async getData() {
		this.data.finalizou = false;
		this.appService.httpGetOffFirst(`proposta/detalhe/${this.route.snapshot.params.id_lead}`)
			.pipe(finalize(() => { this.data.finalizou = true; }))
			.subscribe(async (data) => { 
				this.data = data;
				this.data?.lead?.pets.forEach(async (pet,index) => {
					this.data.lead.pets[index].assinatura = await this.appService.httpGet(`associado/getAssinaturaId/${pet?.id}`);
				});
			}, this.appService.errorHandler);

		this.data?.lead?.pets.forEach(async (pet) => {
			console.log(pet?.nome)
		});
	}

	async open_modal_alterar_dados() {
		const modal = await this.modalController.create({
			component: AlterarDadosClienteComponent,
			componentProps: { pessoa: this.data.lead.pessoa  , proposta : this.data.lead.proposta },
		});
		await modal.present();
	}
	async open_modal_add_pet() {
		const modal = await this.modalController.create({
			component: AdicionarPetComponent,
			componentProps: { proposta : this.data.lead.proposta },
		});
		await modal.present();
	}
	async open_modal_excluir_plano(pet) {
		const modal = await this.modalController.create({
			component: ExcluirPropostaComponent,
			componentProps: { pet: { id_pet: pet?.id, pet_name: pet?.nome }},
		});
		return await modal.present();
	}
	ngOnDestroy() {
		try {
			if (this.subscribe) this.subscribe.unsubscribe();
		} catch (e) { }
	}
	async call() {
		setTimeout(() => {
			let tel = this.data.lead.pessoa.telefone && this.data.lead.pessoa.telefone.replace(/[ ()-]/g, '');
			window.open(`tel:${tel}`, '_system');
		}, 100);
	}
	async whatsapp() {
		setTimeout(() => {
			this.data.lead.pessoa.telefone_whats = this.data.lead.pessoa.telefone && this.data.lead.pessoa.telefone.replace(/[ ()-]/g, '');
			this.data.lead.pessoa.telefone_whats = this.data.lead.pessoa.telefone_whats.slice(0, 2) + this.data.lead.pessoa.telefone_whats.slice(3);
			this.data.lead.pessoa.telefone_whats = '55' + this.data.lead.pessoa.telefone_whats;
			window.open(`https://api.whatsapp.com/send?phone=${this.data.lead.pessoa.telefone_whats}`, '_system');
		}, 100);
	}
	async compartilhar(pet) {
		try {
			let urlFile = (this.appService.enviroment.production) ? `https://aupetheinsten.com.br/proposta/pdf/${pet.hash}` : `http://localhost:8080/proposta/pdf/${pet.hash}`;
			let actionSheet: any = await new Promise(async resolve => {
				let btnActions = [];
				if (pet.plano.shared_msg_status)
					btnActions.push({ text: 'Mensagem de texto', handler: () => resolve('texto') });
				if (pet.plano.shared_pdf_status)
					btnActions.push({ text: 'PDF', handler: () => resolve('pdf') });
				btnActions.push({ text: 'Cancelar', role: 'cancel' });
				await (await this.actionSheetCrtl.create({ header: 'Ações', buttons: btnActions })).present()
			});
			if (actionSheet == 'pdf') {
				if (this.appService.platform.is('cordova')) {
					await this.appService.socialSharing.share('Proposta de filiação', 'Proposta de filiação', urlFile);
				} else {
					let msg = `Este é o link para sua proposta em PDF\n${urlFile}`;
					this.appService.sharedMsg(msg);
				}
			} else {
				this.appService.sharedMsg(pet.msg_shared);
			}
		} catch (e) {
			this.appService.sharedMsg(pet.msg_shared);
		}
	}

	share(pet) {
		if (this.appService.enviroment.production)
			this.appService.sharedMsg(`Olá ${this.data?.lead?.pessoa?.nome},esse é o seu link pagamento da Assinatua AupetHeinsten\nhttps://aupetheinsten.com.br/proposta/assinatura/${pet.hash}`);
		else
			this.appService.sharedMsg(`Olá ${this.data?.lead?.pessoa?.nome},esse é o seu link pagamento da Assinatua AupetHeinsten\nhttp://${location.hostname}:8080/proposta/assinatura/${pet.hash}`);
	}

	async backPage(){
		await this.appService.navigateUrl(`${this.appService.ambiente}/propostas`);
	}
}