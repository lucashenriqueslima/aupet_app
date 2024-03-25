import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController, NavParams } from '@ionic/angular';
import { AppService } from '../../services/app.service';
@Component({
	selector: 'app-altera-dados-pet',
	templateUrl: './altera-dados-pet.component.html',
	styleUrls: ['./altera-dados-pet.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class AlteraDadosPetComponent implements OnInit {
	pet: any = {};
	racas = [];
	especies = [];
	planos = [];
	load;
	constructor(
		public modalCtrl: ModalController,
		public navParams: NavParams,
		public modalController: ModalController,
		public route: ActivatedRoute,
		public appService: AppService,
	) { }
	ngOnInit() {
		this.selectEspecies();
		this.selectPlanos();
		this.pet = this.navParams.data.pet;
		this.selectRaca(this.pet.id_especie);
	}
	dismiss() {
		this.modalCtrl.dismiss({
			'dismissed': true
		});
	}
	selectRaca(id) {
		this.appService.httpGetOffFirst(`getRaca/${id}`).subscribe(data => {
			this.racas = data;
		});
	}
	async selectEspecies() {
		this.especies = await this.appService.httpGet(`getEspecies`);
	}
	async selectPlanos() {
		this.planos = await this.appService.httpGet(`getPlanos`);
	}
	async salvar() {
		try {
			this.load = true;
			await this.appService.httpPut(`pet/atualizar`, this.pet);
			this.appService.showToast('Dados alterados com sucesso', 3000);
			this.modalCtrl.dismiss();
			this.appService.events.upDetailLead.emit();
		} catch (e) {
			this.appService.errorHandler(e);
		} finally {
			this.load = false;
		}
	}
}
