import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AdicionarVermifugoComponent } from './../../../../modal/adicionar-vermifugo/adicionar-vermifugo.component';
import { AppService } from 'src/app/services/app.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
@Component({
	selector: 'app-vermifugos-pet',
	templateUrl: './vermifugos-pet.page.html',
	styleUrls: ['./vermifugos-pet.page.scss'],
	encapsulation: ViewEncapsulation.None
})
export class VermifugosPetPage implements OnInit {
	params: any = {};
	pet;
	numero_vermigufos;
	vermifungos;
	meses: any = {};
	mesesArray: any = {};
	subUpdateList: Subscription;
	constructor(
		public modalController: ModalController,
		public appService: AppService,
		public route: ActivatedRoute,
	) { }
	ngOnInit() {
		this.subUpdateList = this.appService.events.upAssocVermList.subscribe(() => this.getVermifungos());
		this.getPet();
		this.getVermifungos();
	}
	async open_modal_adicionar_vacina() {
		const modal = await this.modalController.create({
			component: AdicionarVermifugoComponent,
			componentProps: { pet: this.pet },
		});
		return await modal.present();
	}
	async getPet() {
		this.pet = await this.appService.httpGet('associado/getPet/' + this.route.snapshot.params.id);
	}
	async getVermifungos() {
		this.vermifungos = await this.appService.httpGet('pet/vermifungos/' + this.route.snapshot.params.id);
		this.numero_vermigufos = this.vermifungos.length;
		this.groupByMonth();
	}
	async groupByMonth() {
		this.meses = this.vermifungos.reduce(function (r, a) {
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
		this.subUpdateList?.unsubscribe();
	}
}
