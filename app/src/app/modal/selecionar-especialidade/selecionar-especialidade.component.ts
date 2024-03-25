import { AppService } from './../../services/app.service';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
@Component({
	selector: 'app-selecionar-especialidade',
	templateUrl: './selecionar-especialidade.component.html',
	styleUrls: ['./selecionar-especialidade.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class SelecionarEspecialidadeComponent implements OnInit {
	especialidades;
	selecionadas = {};
	constructor(
		public modalCtrl: ModalController,
		public appService: AppService,
		public navParams: NavParams,
	) { }
	ngOnInit() {
		this.especialidades = this.navParams.get('especialidades');
	}
	dismiss() {
		this.modalCtrl.dismiss();
	}
	async selecionar() {
		this.modalCtrl.dismiss();
	}
}
