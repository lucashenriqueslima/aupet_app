import { AppService } from './../../services/app.service';
import { ActivatedRoute } from '@angular/router';
import { Component, ViewEncapsulation } from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';
import { CriarVistoriaPage } from 'src/app/modal/criar-vistoria/criar-vistoria.page';
import { Subscription } from 'rxjs';
@Component({
	selector: 'app-status-lead',
	templateUrl: './status-lead.page.html',
	styleUrls: ['./status-lead.page.scss'],
	encapsulation: ViewEncapsulation.None
})
export class StatusLeadPage {
	status: Array<any>;
	proposta;
	loading;
	pet: any;
	res: any;
	statusVist: any = {};
	statusTerm: any = {};

	termo;
	vistoriaStatus;
	dadosOk;

	subupDetailLead: Subscription;
	constructor(
		public loadingCtrl: LoadingController,
		public modalController: ModalController,
		public activatedRoute: ActivatedRoute,
		public appService: AppService,
		public route: ActivatedRoute
	) { }
	async ngOnInit() {
		this.subupDetailLead = this.appService.events.upDetailLead.subscribe(() => this.getProposta())
		this.loading = await this.loadingCtrl.create({ message: 'Mudando status...' });
		await this.getProposta();

		this.statusVist.aprovado = false;
		this.statusVist.analise = false;
		this.statusVist.reprovado = false;

		this.statusTerm.aprovado = false;
		this.statusTerm.analise = false;
		this.statusTerm.reprovado = false;

		this.termo = await this.appService.httpGet(`proposta/termo/${this.activatedRoute.snapshot.params.id_pet}`);
		this.vistoriaStatus = await this.appService.httpGet(`proposta/vistoria/${this.pet.id_vistoria}`);

		this.statusVistoria();
		this.statusTermo();
	
	}
	ngOnDestroy() {
		this.subupDetailLead.unsubscribe();
	}
	async getProposta() {
		this.res = await this.appService.httpGet(`pet/status/${this.activatedRoute.snapshot.params.id_pet}`);
		this.status = this.res.status;
		this.proposta = this.res.proposta;
		this.pet = this.res.pet;
	}
	async validaEtapa() {
		try {
			await this.loading.present();
			await this.appService.httpPost(`pet/mudarStatus`, { 'id_pet': this.pet.id });
			this.appService.events.upDetailLead.emit();
			this.getProposta();
		} catch (e) {
			this.appService.errorHandler(e);
		} finally {
			await this.loading.dismiss();
			this.loading = await this.loadingCtrl.create({ message: 'Mudando status...' });
		}
	}
	async vistoria() {
		if (!this.pet.id_vistoria) {
			const modal = await this.modalController.create({ component: CriarVistoriaPage, componentProps: { "proposta": this.proposta, "pet": this.pet } });
			await modal.present();
			let retorno = await modal.onDidDismiss();
			if (!retorno.data?.response) return;
			this.appService.navigateRelative(`vistoria/${retorno.data?.response?.id_vistoria}`, this.activatedRoute);
			this.getProposta();
		} else {
			this.appService.navigateRelative(`vistoria/${this.pet.id_vistoria}`, this.activatedRoute);
		}
	}
	checkValidarDisabled(item) {
		// debugger
		if (item.vistoria && !this.res.vistoriaOk) return true;
		else if (item.dados && !this.res.dadosOk) return true;
		else if (item.contrato && !this.res.termoOk) return true;
		else return false;
	}
	async sendAccess(){
		// console.log(this.route.snapshot.params.id_lead);
		try {
			await this.appService.httpPost(`associado/setSenha/${this.route.snapshot.params.id_lead}`);
			
			this.appService.showSuccess(null, 'Dados de acesso enviados com sucesso!');
		} catch (error) {
			this.appService.showAlert(null,'Erro ao enviar acesso! Por favor tente novamente.');
		}

	}

	statusVistoria(){
		if((this.pet.vistoriaEnviada || this.res.vistoriaOk) && this.pet.status_vistoria != 'Aprovada') this.statusVist.analise = true;
		if(this.pet.status_vistoria == 'Aprovada') this.statusVist.aprovado = true;

		let reprovado = this.vistoriaStatus.items.find(foto => foto.aprovado === 0)?.aprovado;
		if(reprovado != null) this.statusVist.reprovado = true;

	}

	statusTermo(){
		if(this.pet.termoEnviado && this.pet.status_termo != 'aprovada' && !this.termo.indicacao?.doc_recusados?.includes('assinatura')) this.statusTerm.analise = true;
		if(this.pet.status_termo == 'aprovada') this.statusTerm.aprovado = true;
		if(this.termo.indicacao?.doc_recusados?.includes('assinatura')) this.statusTerm.reprovado = true;
	}
}