import { AppService } from './../../services/app.service';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
@Component({
	selector: 'app-filtrar-lead',
	templateUrl: './filtrar-lead.component.html',
	styleUrls: ['./filtrar-lead.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class FiltrarLeadComponent implements OnInit {
	constructor(
		public modalCtrl: ModalController,
		public appService: AppService,
		public navParams: NavParams,
	) { }
	situacoes: any;
	ordem;
	filtros: any = {
		classificacao: {},
		status: {},
		situacao: {},
		ordem: {}
	}
	ngOnInit() {
		this.ordem = Object.assign({}, this.navParams.data.ordem);
		this.situacoes = Array.from(this.navParams.data.situacoes || []);
		this.checkFiltros();
	}
	checkFiltros() {
		if (!location.href.split('?')[1]) return;
		let params = new URLSearchParams(location.href.split('?')[1]);
		let classificacao = params.get('classificacao');
		if (classificacao) classificacao.split(',').forEach(x => this.filtros.classificacao[x] = true);
		let status = params.get('status');
		if (status) status.split(',').forEach(x => this.filtros.status[x] = true);
		let situacao = params.get('situacao');
		if (situacao) situacao.split(',').forEach(x => this.filtros.situacao[x] = true);
	}
	async filtrar_leads() {
		let query = '';
		for (var key in this.filtros) {
			if (this.appService.isEmpty(this.filtros[key])) continue;
			let _query = '';
			if (typeof this.filtros[key] == 'object') {
				if (key == 'classificacao' || key == 'situacao') {
					_query = Object.entries(this.filtros[key]).filter(x => x[1]).map(x => x[0]).join(',')
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
		this.modalCtrl.dismiss(this.ordem);
		this.appService.events.filtraListaLeads.emit();
	}
	dismiss() {
		this.modalCtrl.dismiss();
	}
	limparFiltros() {
		let loc = location.hash.split('?')[0]
		window.history.replaceState(null, '', loc);
	}
	limparSair() {
		this.limparFiltros();
		this.modalCtrl.dismiss();
		this.appService.events.filtraListaLeads.emit();
	}
}