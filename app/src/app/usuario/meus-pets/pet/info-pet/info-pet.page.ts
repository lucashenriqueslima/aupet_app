import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Subject, Subscriber, Subscription } from 'rxjs';
import { AppService } from 'src/app/services/app.service';
import { Keyboard } from '@awesome-cordova-plugins/keyboard/ngx';
import { ActionSheetController, ModalController, LoadingController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { ExcluirCadastroPetComponent } from './../../../../modal/excluir-cadastro-pet/excluir-cadastro-pet.component';
import { AssinarPlanoComponent } from './../../../../modal/assinar-plano/assinar-plano.component';

@Component({
	selector: 'app-info-pet',
	templateUrl: './info-pet.page.html',
	styleUrls: ['./info-pet.page.scss'],
	encapsulation: ViewEncapsulation.None
})
export class InfoPetPage {
	pet: any = {};
	assinatura: any = {};
	statusAssinatura;
	load;
	havePlan = false;
	data: any = {};
	subDetalhes: Subscription;
	mensalidade;
	constructor(
		public appService: AppService,
		public route: ActivatedRoute,
		private actionSheetCrtl: ActionSheetController,
		public loadingCtrl: LoadingController,
		public modalController: ModalController
		
	) { }
	async ngOnInit() {
		this.getPet();
		this.getAssinatura();
		this.subDetalhes = this.appService.events.upAssciadoPetDetalhes.subscribe(() => { this.getPet(); this.getAssinatura() });
		
	}
	async getPet() {
		this.pet = await this.appService.httpGet('associado/getPet/' + this.route.snapshot.params.id);
		this.verifyPlanoPet();
	}
	async getAssinatura(){
		let dados = await this.appService.httpGet(`associado/getAssinatura/${this.appService.user.associado.id}/${this.route.snapshot.params.id}`);
		this.assinatura = dados.assinatura;
		if(this.assinatura) {
			let pagamentos = await this.appService.httpGet(`pagamentos/buscarPagamentosAssinatura/${this.assinatura.assinatura}`);
			this.mensalidade = (await this.appService.httpGet(`pagamentos/listaAssinaturaPagamentos/${this.assinatura.external_reference}`))[0]; 
			if(pagamentos.message) this.appService.showAlert(null,pagamentos.message);
			else this.statusAssinatura = pagamentos.payment_status;
		}
	}

	async compartilhar() {
		try {
			this.load = true;
			if (this.pet.id_plano == null) throw 'O Pet Ainda Não Possui Plano';
			else if(this.pet.classificacao != 'ativada') throw 'O Pet Ainda Não Possui Um Plano Ativo';
			else if(!this.assinatura) {
				await this.appService.navigateUrl(`${this.appService.ambiente}/cartao-pagamento`);
				throw 'Verifique os dados de pagamento da assinatura!';
			}
			else if(!this.statusAssinatura) throw 'Pagamento Atrasado ou ainda não creditado!';
			let urlFile = `${this.appService.enviroment.urlApi}pet/montarCarterinha/${this.pet.hash}`;
			let actionSheet: any = await new Promise(async resolve => {
				let btnActions = [];
				btnActions.push({ text: 'Compartilhar', handler: () => resolve('pdf') });
				btnActions.push({ text: 'Visualizar', handler: () => resolve('ver') });
				btnActions.push({ text: 'Cancelar', role: 'cancel' });
				await (await this.actionSheetCrtl.create({ header: 'Ações', buttons: btnActions })).present()
			});
			if (actionSheet == 'pdf') {
				if (this.appService.platform.is('cordova')) {
					await this.appService.socialSharing.share(`Caterinha do Pet-${this.pet.nome}`, `Carterinha do Pet-${this.pet.nome}`, urlFile);
				} else {
					let msg = `Este é o link para sua Carterinha em PDF\n ${urlFile}`;
					this.appService.sharedMsg(msg);
				}
			} else {
				window.open(urlFile, '_blank');
			}
		} catch (e) {
			this.appService.errorHandler(e);
		} finally {
			this.load = false;
		}
	}
	ngOnDestroy() {
		this.subDetalhes?.unsubscribe();
	}
	async desarquivarProposta(id){
		try {
		  this.load = true;
		  
		  this.data.classificacao = 'pendente';
		  this.data.arquivado_em = null;
		  this.data.id = id;
		  
		  await this.appService.httpPut('pet/desarquivar', this.data);
		  this.appService.showToast('Pet desarquivado com sucesso', 3000);
		  window.location.reload();
		} catch (e) {
		  this.appService.errorHandler(e);
		} finally {
		  this.load = false;
		}
	}

	verifyPlanoPet(){
		if(this.pet.id_plano && this.pet.classificacao == 'ativada') this.havePlan = true;
		else this.havePlan = false;
	}

	detalhesPlano(id_pet){
		this.appService.navigateUrl(`/associado/meus-pets/dados-pet/${id_pet}`);
	}

	async open_modal_excluir_pet() {
		const modal = await this.modalController.create({
			component: ExcluirCadastroPetComponent,
			componentProps: { pet: this.pet },
		});
		return await modal.present();
	}

	async open_modal_assinar_plano() {
		const modal = await this.modalController.create({
			component: AssinarPlanoComponent,
			componentProps: { params: this.pet },
		});
		return await modal.present();
	}

	mensalidades(){
		this.appService.navigateUrl(`${this.appService.ambiente}/mensalidades/${this.assinatura.assinatura}/${this.pet.id}`);
	}

	backPage() {
		window.history.back();
	}
}