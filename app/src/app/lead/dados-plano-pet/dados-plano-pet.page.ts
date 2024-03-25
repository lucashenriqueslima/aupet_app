import { AppService } from './../../services/app.service';
import { ActivatedRoute } from '@angular/router';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ArquivarPropostaComponent } from './../../modal/arquivar-proposta/arquivar-proposta.component';
import { AlteraDadosPetComponent } from './../../modal/altera-dados-pet/altera-dados-pet.component';
@Component({
	selector: 'app-dados-plano-pet',
	templateUrl: './dados-plano-pet.page.html',
	styleUrls: ['./dados-plano-pet.page.scss'],
	encapsulation: ViewEncapsulation.None
})
export class DadosPlanoPetPage implements OnInit {
	data: any = {};
	load;
	beneficios;
	assinatura;
	mensalidade;
	statusAssinatura;
	constructor(
		public modalController: ModalController,
		public route: ActivatedRoute,
		public appService: AppService,
	) { }
	ngOnInit() {
		this.info();
		this.getAllBeneficios();
		this.getAssinatura();
	}

	async info() {
		this.data = await this.appService.httpGet(`pet/proposta/${this.route.snapshot.params.id_pet}`);
	}

	async getAssinatura(){
		let dados = await this.appService.httpGet(`associado/getAssinatura/${this.appService.user.associado.id}/${this.route.snapshot.params.id_pet}`);
		this.assinatura = dados.assinatura;
		if(this.assinatura) {
			let pagamentos = await this.appService.httpGet(`pagamentos/buscarPagamentosAssinatura/${this.assinatura.assinatura}`);
			this.mensalidade = (await this.appService.httpGet(`pagamentos/listaAssinaturaPagamentos/${this.assinatura.external_reference}`))[0]; 
			if(pagamentos.message) this.appService.showAlert(null,pagamentos.message);
			else this.statusAssinatura = pagamentos.payment_status;
		}
	}

	async getAllBeneficios() {
		this.beneficios = await this.appService.httpGet(`getBeneficios`);
	}

	public planoBeneficioOn(petBeneficio, beneficio) {
		let benf = petBeneficio?.find(e => e.id == beneficio.id);
		if (benf !== undefined) return true; else return false;
	}
	public planoBeneficioOff(petBeneficio, beneficio) {
		let benf = petBeneficio?.find(e => e.id == beneficio.id);
		if (!(benf !== undefined)) return true; else return false;
	}

	alterarPlano(){
		if(this.appService.ambiente == 'associado') this.appService.navigateUrl(`${this.appService.ambiente}/planos/${this.route.snapshot.params.id_pet}/${this.data.plano.id}`);
		if(this.appService.ambiente == 'consultor') this.appService.navigateUrl(`${this.appService.ambiente}/proposta/${this.route.snapshot.params.id_lead}/dados-pet/${this.route.snapshot.params.id_pet}`);
	}

	cancelarPlano(){
		this.appService.navigateUrl(`${this.appService.ambiente}/cancelar-plano/${this.route.snapshot.params.id_pet}/${this.data.plano.id}`);
	}

	backPage() {
		if(this.appService.ambiente == 'consultor') this.appService.navigateUrl(`${this.appService.ambiente}/proposta/${this.route.snapshot.params.id_lead}`);
		else window.history.back();
	}

}