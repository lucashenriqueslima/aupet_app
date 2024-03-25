import { AppService } from './../../services/app.service';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
@Component({
	selector: 'app-filtro-mapa',
	templateUrl: './filtro-mapa.component.html',
	styleUrls: ['./filtro-mapa.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class FiltroMapaComponent implements OnInit {
	especialidades;
	especialidade;
	filtros = {
		especialidade: [],
	}
	constructor(
		public modalCtrl: ModalController,
		public appService: AppService,
		public navParams: NavParams,
	) { }
	ngOnInit() {
		this.especialidades = Array.from(this.navParams.data.especialidades || []);
		this.checkFiltros();
	}
	checkFiltros() {
		if (!location.href.split('?')[1]) return;
		let params = new URLSearchParams(location.href.split('?')[1]);
		let especialidade = params.get('especialidade');
		if (especialidade) especialidade.split(',').forEach(x => {
			let item = this.especialidades.find(y => y.id == x);
			this.filtros.especialidade.push(item);
			this.especialidades.splice(this.especialidades.indexOf(item), 1);
		});
	}
	async filtrar_leads() {
		let query = '';
		for (var key in this.filtros) {
			if (this.appService.isEmpty(this.filtros[key])) continue;
			let _query = '';
			if (typeof this.filtros[key] == 'object') {
				if (key == 'especialidade') {
					_query = this.filtros[key].map(x => x.id).join(',');
				}
			} else if (typeof this.filtros[key] == 'string') {
				_query = this.filtros[key];
			}
			if (this.appService.isEmpty(_query)) continue;
			if (query != '') query += '&';
			query += key + '=' + _query;
		}
		this.limparFiltros();
		if (query) query = '?' + query;
		window.history.replaceState(null, '', location.hash + query);
		this.modalCtrl.dismiss();
		this.appService.events.filtraClinicasMap.emit();
	}
	limparFiltros() {
		let loc = location.hash.split('?')[0]
		window.history.replaceState(null, '', loc);
	}
	adicionaEspecialidade(item) {
		this.filtros.especialidade.push(item);
		this.especialidades.splice(this.especialidades.indexOf(item), 1);
	}
	removerEspecialidade(item) {
		this.especialidades.push(item);
		this.filtros.especialidade.splice(this.filtros.especialidade.indexOf(item), 1);
		this.especialidades.sort(this.shortByName);
		this.especialidade = {};
	}
	shortByName(a, b) {
		if (a.ordem < b.ordem) return -1;
		else if (a.ordem > b.ordem) return 1;
		else return 0;
	}
}