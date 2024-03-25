import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AdicionarVacinaComponent } from './../../../../modal/adicionar-vacina/adicionar-vacina.component';
import { DirecionarPlanoComponent } from './../../../../modal/direcionar-plano/direcionar-plano.component';
import { AppService } from 'src/app/services/app.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
@Component({
	selector: 'app-vacinas-pet',
	templateUrl: './vacinas-pet.page.html',
	styleUrls: ['./vacinas-pet.page.scss'],
	encapsulation: ViewEncapsulation.None
})
export class VacinasPetPage implements OnInit {
	pet: any = {};
	clinicas: any = {};
	numero_vacinas;
	vacinas;
	meses: any = {};
	mesesArray: any = {};
	subUpList: Subscription;
	assinatura: any = {};
	statusAssinatura;
	constructor(
		public modalController: ModalController,
		public appService: AppService,
		public route: ActivatedRoute,
	) { }
	ngOnInit() {
		this.subUpList = this.appService.events.upAssocVacinaList.subscribe(() => this.getVacinas());
		this.getPet();
		this.getVacinas();
		this.getAssinatura();
	}
	async open_modal_adicionar_vacina() {
		let mod;
		if (this.pet.id_plano && this.pet.classificacao === 'ativada') {
			mod = AdicionarVacinaComponent;
		} else {
			mod = DirecionarPlanoComponent;
		}
		const modal = await this.modalController.create({
			component: mod,
			componentProps: { pet: this.pet, clinicas: this.clinicas },
		});
		if(this.pet.classificacao === 'ativada' && this.assinatura == null){
			try {
				await this.appService.navigateUrl(`${this.appService.ambiente}/cartao-pagamento`);
				throw 'Verifique os dados de pagamento da assinatura!';
			} catch (error) {
				this.appService.errorHandler(error);
			}			
		} else {
			if(this.assinatura!= null && !this.statusAssinatura){
				try {
					throw 'Pagamento de Assinatura Atrasado ou ainda não creditado!Tente novamente mais tarde!';
				} catch (error) {
					this.appService.errorHandler(error);
				}
			}else{
				return await modal.present();
			}
		}	
	}
	async getVacinas() {
		this.vacinas = await this.appService.httpGet('pet/vacinas/' + this.route.snapshot.params.id);
		this.numero_vacinas = this.vacinas.length;
		this.groupByMonth();
	}
	async groupByMonth() {
		this.meses = this.vacinas.reduce(function (r, a) {
			r[a.mes] = r[a.mes] || [];
			r[a.mes].push(a);
			return r;
		}, Object.create(null));
		this.mesesArray = Object.values(this.meses);
		this.meses = Object.getOwnPropertyNames(this.meses);
	}
	async getPet() {
		this.pet = await this.appService.httpGet('associado/getPet/' + this.route.snapshot.params.id);
		let dados = await this.appService.httpGet('pet/getClinicasByPlanoPet/' + this.route.snapshot.params.id);
		this.clinicas = dados.clinicas;
	}
	async getAssinatura(){
		let dados = await this.appService.httpGet(`associado/getAssinatura/${this.appService.user.associado.id}/${this.route.snapshot.params.id}`);
		this.assinatura = dados.assinatura;
		if(this.assinatura) { 
			let pagamentos = await this.appService.httpGet(`pagamentos/buscarPagamentosAssinatura/${this.assinatura.assinatura}`); 
			this.statusAssinatura = pagamentos.payment_status;
		}
	}
	backPage() {
		window.history.back();
	}
	ngOnDestroy() {
		this.subUpList?.unsubscribe();
	}
}
