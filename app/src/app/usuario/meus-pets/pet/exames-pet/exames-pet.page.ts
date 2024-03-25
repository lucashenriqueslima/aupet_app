import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AdicionarExameComponent } from './../../../../modal/adicionar-exame/adicionar-exame.component';
import { DirecionarPlanoComponent } from './../../../../modal/direcionar-plano/direcionar-plano.component';
import { Subject, Subscription } from 'rxjs';
import { AppService } from 'src/app/services/app.service';
import { Keyboard } from '@awesome-cordova-plugins/keyboard/ngx';
import { ActivatedRoute } from '@angular/router';
@Component({
	selector: 'app-exames-pet',
	templateUrl: './exames-pet.page.html',
	styleUrls: ['./exames-pet.page.scss'],
	encapsulation: ViewEncapsulation.None
})
export class ExamesPetPage implements OnInit {
	numero_exames;
	exames: any = {};
	pet: any = {};
	clinicas: any = {};
	meses: any = Array();
	mesesArray;
	subUpListAgendamentos: Subscription;
	constructor(
		public modalController: ModalController,
		public appService: AppService,
		public route: ActivatedRoute,
	) { }
	params: any = {};
	assinatura: any = {};
	statusAssinatura;
	ngOnInit() {
		this.subUpListAgendamentos = this.appService.events.upAssocListExame.subscribe(() => this.getAgendamentos());
		this.getAgendamentos();
		this.getPet();
		this.getAssinatura();
	}
	async open_modal_adicionar_exame() {
		let mod;
		//debugger
		if (this.pet.id_plano && this.pet.classificacao === 'ativada') {
			mod = AdicionarExameComponent;
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
			if(this.assinatura != null && !this.statusAssinatura){
				try {
					// await this.appService.navigateUrl(`${this.appService.ambiente}/cartao-pagamento`);		
					throw 'Pagamento de Assinatura Atrasado ou ainda não creditado! Tente novamente mais tarde!';
				} catch (error) {
					this.appService.errorHandler(error);
				}
			}else{
				return await modal.present();
			}
		}	
		
	}
	async getAgendamentos() {
		let dados = await this.appService.httpGet(`pet/getExames/${this.route.snapshot.params.id}`);
		this.exames = dados.exames;
		this.numero_exames = this.exames.length;
		this.groupByMonth();
	}
	async getPet() {
		this.pet = await this.appService.httpGet('pet/getPet/' + this.route.snapshot.params.id);
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
	async groupByMonth() {
		this.meses = this.exames.reduce(function (r, a) {
			r[a.mes] = r[a.mes] || [];
			r[a.mes].push(a);
			return r;
		}, Object.create(null));
		this.mesesArray = Object.values(this.meses);
		this.meses = Object.getOwnPropertyNames(this.meses);
	}
	ngOnDestroy() {
		this.subUpListAgendamentos.unsubscribe();
	}
}
