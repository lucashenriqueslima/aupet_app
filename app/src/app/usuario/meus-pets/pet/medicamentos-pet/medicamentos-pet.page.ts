import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AdicionarMedicamentoComponent } from './../../../../modal/adicionar-medicamento/adicionar-medicamento.component';
import { Subject, Subscription } from 'rxjs';
import { AppService } from 'src/app/services/app.service';
import { Keyboard } from '@awesome-cordova-plugins/keyboard/ngx';
import { ActivatedRoute } from '@angular/router';
@Component({
	selector: 'app-medicamentos-pet',
	templateUrl: './medicamentos-pet.page.html',
	styleUrls: ['./medicamentos-pet.page.scss'],
	encapsulation: ViewEncapsulation.None
})
export class MedicamentosPetPage implements OnInit {
	numero_medicamentos;
	medicamentos: any = {};
	pet: any = {};
	meses: any = Array();
	mesesArray;
	subUpList: Subscription
	constructor(
		public modalController: ModalController,
		public appService: AppService,
		public route: ActivatedRoute,
	) { }
	params: any = {};
	assinatura: any = {};
	statusAssinatura;
	ngOnInit() {
		this.subUpList = this.appService.events.upAssocListMedicamentos.subscribe(() => this.getAgendamentos());
		this.getAgendamentos();
		this.getPet();
		this.getAssinatura();
	}
	async open_modal_adicionar_vacina() {
		const modal = await this.modalController.create({
			component: AdicionarMedicamentoComponent,
			componentProps: { pet: this.pet },
		});
		return await modal.present();
	}
	async getAgendamentos() {
		let dados = await this.appService.httpGet(`pet/getMedicamentos/${this.route.snapshot.params.id}`);
		this.medicamentos = dados.medicamentos;
		this.numero_medicamentos = this.medicamentos.length;
		this.groupByMonth();
	}
	async getPet() {
		this.pet = await this.appService.httpGet('pet/getPet/' + this.route.snapshot.params.id);
	}
	async getAssinatura(){
		let dados = await this.appService.httpGet(`associado/getAssinatura/${this.appService.user.associado.id}/${this.route.snapshot.params.id}`);
		this.assinatura = dados.assinatura;
		if(this.assinatura) { 
			let pagamentos = await this.appService.httpGet(`pagamentos/buscarPagamentosAssinatura/${this.assinatura.assinatura}`); 
			this.statusAssinatura = pagamentos.payment_status;
		}
	}
	async groupByMonth() {
		this.meses = this.medicamentos.reduce(function (r, a) {
			r[a.mes] = r[a.mes] || [];
			r[a.mes].push(a);
			return r;
		}, Object.create(null));
		this.mesesArray = Object.values(this.meses);
		this.meses = Object.getOwnPropertyNames(this.meses);
		// console.log(this.medicamentos);
	}
	backPage() {
		window.history.back();
	}
	ngOnDestroy() {
		this.subUpList?.unsubscribe();
	}
}
