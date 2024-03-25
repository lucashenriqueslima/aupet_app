import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AppService } from 'src/app/services/app.service';
import { ActivatedRoute } from '@angular/router';
//MODAL
import { AdicionarBanhoComponent } from './../../../../modal/adicionar-banho/adicionar-banho.component';
import { Subscription } from 'rxjs';
@Component({
	selector: 'app-banhos-pet',
	templateUrl: './banhos-pet.page.html',
	styleUrls: ['./banhos-pet.page.scss'],
	encapsulation: ViewEncapsulation.None
})
export class BanhosPetPage implements OnInit {
	params: any = {};
	pet: any = {};
	clinicas: any = {};
	banhos;
	meses: any = {};
	mesesArray: any = {};
	numero_banhos;
	subUpList: Subscription;
	constructor(
		public modalController: ModalController,
		public appService: AppService,
		public route: ActivatedRoute,
	) { }
	async ngOnInit() {
		this.subUpList = this.appService.events.upAssocBanhoList.subscribe(() => this.getBanhos());
		this.getPet();
		this.getBanhos();
	}
	async open_modal_adicionar_vacina() {
		const modal = await this.modalController.create({
			component: AdicionarBanhoComponent,
			componentProps: { pet: this.pet, clinicas: this.clinicas },
		});
		return await modal.present();
	}
	async getPet() {
		this.pet = await this.appService.httpGet('associado/getPet/' + this.route.snapshot.params.id);
		let dados = await this.appService.httpGet('pet/getClinicasByPlanoPet/' + this.route.snapshot.params.id);
		this.clinicas = dados.clinicas;
	}
	async getBanhos() {
		this.banhos = await this.appService.httpGet('pet/banhos/' + this.route.snapshot.params.id);
		this.numero_banhos = this.banhos.length;
		this.groupByMonth();
	}
	groupByMonth() {
		this.meses = this.banhos.reduce(function (r, a) {
			r[a.mes] = r[a.mes] || [];
			r[a.mes].push(a);
			return r;
		}, Object.create(null));
		this.mesesArray = Object.values(this.meses);
		this.meses = Object.getOwnPropertyNames(this.meses);
	}
	backPage() {
		window.history.back();
	}
	ngOnDestroy() {
		this.subUpList?.unsubscribe();
	}
}
