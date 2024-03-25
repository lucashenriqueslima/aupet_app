import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ModalController, ActionSheetController, LoadingController } from '@ionic/angular';
import { AppService } from 'src/app/services/app.service';
import { ActivatedRoute } from '@angular/router';
@Component({
	selector: 'app-contrato',
	templateUrl: './contrato.page.html',
	styleUrls: ['./contrato.page.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class ContratoPage {
	constructor(
		public activatedRoute: ActivatedRoute,
		public modalCtrl: ModalController,
		public appService: AppService,
		private actionSheetCrtl: ActionSheetController,
		public loadingCtrl: LoadingController,
	) { }
	contrato_tipo;
	templates;
	indicacao;
	id_contrato;
	loading;
	subContratoUpdate;
	data;
	perguntas;
	async ngOnInit() {
		this.loading = await this.loadingCtrl.create({ message: 'Carregando ...' });
		this.getInfo();
		this.subContratoUpdate = this.appService.events.contratoUpdate.subscribe(() => this.getInfo());
	}
	async getInfo() {
		try {
			await this.loading.present();
			let res = await this.appService.httpGet(`proposta/termo/${this.activatedRoute.snapshot.params.id_pet}`);
			this.perguntas = await this.appService.httpGet('proposta/termo/variaveis/' + this.activatedRoute.snapshot.params.id_pet);
			this.data = Object.assign({}, res);
			this.indicacao = res.indicacao;
			this.contrato_tipo = res.indicacao.contrato_tipo;
			this.templates = res.contratos;
			this.id_contrato = res.indicacao.id_contrato;
			this.changeTipo();
		} catch (e) {
			this.appService.errorHandler(e);
		} finally {
			await this.loadingDimiss();
		}
	}
	async salvar() {
		try {
			if (!this.id_contrato) throw "Selecione o contrato";
			await this.appService.httpPost(`proposta/setcontrato/${this.activatedRoute.snapshot.params.id_pet}`, { 'id_contrato': this.id_contrato });
			this.ngOnInit();
		} catch (e) {
			this.appService.errorHandler(e);
		}
	}
	share() {
		if (this.appService.enviroment.production)
			this.appService.sharedMsg(`Esse é o seu link para visualização do termo de filiação\nhttps://aupetheinsten.com.br/proposta/assinatura/${this.indicacao.hash}`);
		else
			this.appService.sharedMsg(`Esse é o seu link para visualização do termo de filiação\nhttp://${location.hostname}:8080/proposta/assinatura/${this.indicacao.hash}`);
	}
	infoContrato() {
		this.appService.navigateUrl(this.appService.router.url + '/info-adicionais');
		this.appService.navigateRelative('info-adicionais', this.activatedRoute);
	}
	compartilhamentoDisabled() {
		try { return !(this.indicacao.id_contrato && this.indicacao.perguntas_contrato); } catch (e) { return true; }
	}
	infoContratoDisabled() {
		try { return !(this.indicacao.id_contrato && (!this.indicacao.assinatura || this.indicacao.doc_recusados) ); } catch (e) { return true; }
	}
	infoAssinarDisabled() {
		try {
			if (this.indicacao.id_contrato && !this.indicacao.assinatura && this.indicacao.perguntas_contrato) return false;
			else if (this.indicacao.doc_recusados.includes('assinatura')) return false;
			else return true;
		} catch (e) { return true; }
	}
	contratoDisabled() {
		try { return (this.indicacao.id_contrato); } catch (e) { return true; }
	}
	ngOnDestroy() {
		this.appService.events.upDetailLead.emit();
		this.subContratoUpdate && this.subContratoUpdate.unsubscribe();
	}
	async assinar() {
		let actionSheet: any = await new Promise(async resolve => {
			let btnActions = [];
			btnActions.push({ text: 'Aplicativo', handler: () => resolve('app') });
			// verificar se esta ativada no sistema
			btnActions.push({ text: 'Externa', handler: () => resolve('ext') });
			btnActions.push({ text: 'Cancelar', role: 'cancel' });
			await (await this.actionSheetCrtl.create({ header: 'Ações', buttons: btnActions })).present()
		});
		if (actionSheet == 'app') {
			this.appService.navigateRelative("assinatura", this.activatedRoute);
		} else if (actionSheet == 'ext') {
			if (this.appService.enviroment.production)
				this.appService.sharedMsg(`Esse é o seu link para visualização e assinatura do termo de filiação\nhttps://aupetheinsten.com.br/proposta/assinatura/${this.indicacao.hash}`);
			else
				this.appService.sharedMsg(`Esse é o seu link para visualização e assinatura do termo de filiação\nhttp://${location.hostname}:8080/proposta/assinatura/${this.indicacao.hash}`);
		}
	}
	async selecionarTipo() {
		try {
			if (!this.contrato_tipo) throw "Selecione o tipo";
			if (this.btnSaveTipoShowAlert && !confirm('Alterar o tipo de termo de "Digital" para "Manuscrito" removerá todas as informações do termo já criado. \nDESEJA CONTINUAR?')) return;
			await this.loading.present();
			await this.appService.httpPost(`proposta/settipocontrato/${this.activatedRoute.snapshot.params.id_pet}`, { 'contrato_tipo': this.contrato_tipo });
			this.appService.events.upDetailLead.emit();
			this.getInfo();
		} catch (e) {
			this.appService.errorHandler(e);
		} finally {
			await this.loadingDimiss();
		}
	}
	async loadingDimiss() {
		await this.loading.dismiss();
		this.loading = await this.loadingCtrl.create({ message: 'Carregando ...' });
	}
	btnSaveTipoShow;
	btnSaveTipoShowAlert;
	changeTipo() {
		if (!this.data?.indicacao?.contrato_tipo) {
			this.btnSaveTipoShow = true;
			this.btnSaveTipoShowAlert = false;
		} else if (this.contrato_tipo != this.data?.indicacao?.contrato_tipo) {
			this.btnSaveTipoShow = true;
			if (this.contrato_tipo == 'Manuscrito' && this.data?.indicacao?.contrato_tipo == 'Digital') this.btnSaveTipoShowAlert = true;
			else this.btnSaveTipoShowAlert = false;
		} else {
			this.btnSaveTipoShow = false;
			this.btnSaveTipoShowAlert = false;
		}
	}
}