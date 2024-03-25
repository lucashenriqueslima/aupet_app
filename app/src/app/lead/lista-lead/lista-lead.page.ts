import { __core_private_testing_placeholder__, async } from '@angular/core/testing';
import { Keyboard } from '@awesome-cordova-plugins/keyboard/ngx';
import { AppService } from './../../services/app.service';
import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
//MODAL
import { FiltrarLeadComponent } from './../../modal/filtrar-lead/filtrar-lead.component';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { ButtonSearchComponent } from './../../componentes/button-search/button-search.component';
@Component({
	selector: 'app-lista-lead',
	templateUrl: './lista-lead.page.html',
	styleUrls: ['./lista-lead.page.scss'],
	encapsulation: ViewEncapsulation.None
})
export class ListaLeadPage {
	public status = "closed";
	public search_open = false;
	public data;
	origindata;
	params: any = {};
	subscribeFiltraListaLeads;
	subscribeUpList;
	indicadores;
	situacoes;
	origens;
	ordem = { prop: 'dt_atualizada', asc: 0 };
	searchTermStream = new Subject<any>();
	termSearch;
	@ViewChild('searchbarleads', { static: false }) searchBar: ElementRef;
	constructor(
		public keyboard: Keyboard,
		public modalController: ModalController,
		public appService: AppService,
		public router: ActivatedRoute,
	) { }
	ngOnInit() {
		this.subscribeFiltraListaLeads = this.appService.events.filtraListaLeads.subscribe(() => this.filter());
		this.searchTermStream.pipe(debounceTime(400)).pipe(distinctUntilChanged()).subscribe((value) => this.searchTerm(value));
		this.appService.httpGetOffFirst(`getSituacoes`).subscribe(data => this.situacoes = data, this.appService.errorHandler);
		this.getLeads();
	}
	async getLeads(ev = null) {
		let finaly = () => { ev && ev.target.complete() };
		this.appService.httpGetOffFirst(`proposta/propostas`)
			.pipe(finalize(finaly))
			.subscribe(data => { this.origindata = Array.from(data.leads); this.filter(); }, this.appService.errorHandler);
	}
	filter() {
		this.data = Array.from(this.origindata);
		if (this.termSearch && this.termSearch != '') return this.searchTerm(this.termSearch);
		if (!location.href.split('?')[1]) return;
		let filtros = [];
		let params = new URLSearchParams(location.href.split('?')[1]);
		let classificacao = params.get('classificacao');
		if (classificacao) filtros.push(classificacao.split(',').map(y => `x.classificacao == '${y}'`).reduce((a, b) => `${a} || ${b}`));
		let situacao = params.get('situacao');
		if (situacao) filtros.push(situacao.split(',').map(y => `x.id_status == '${y}'`).reduce((a, b) => `${a} || ${b}`));
		let query = 'x => ' + filtros.reduce((a, b) => `(${a}) && (${b})`);
		this.data = this.data.filter(eval(query));
		// this.ordenar(this.ordem);		
	}
	ordenar(ordem) {
		let list = Array.from(this.data);
		this.data = [];
		if (ordem.prop == this.ordem.prop) ordem.asc = !this.ordem.asc;
		else ordem.asc = 1;
		list.sort((a, b) => ordem.asc ? (a[ordem.prop]?.toLowerCase() < b[ordem.prop]?.toLowerCase() ? -1 : a[ordem.prop]?.toLowerCase() > b[ordem.prop]?.toLowerCase() ? 1 : 0) : (a[ordem.prop]?.toLowerCase() > b[ordem.prop]?.toLowerCase() ? -1 : a[ordem.prop]?.toLowerCase() < b[ordem.prop]?.toLowerCase() ? 1 : 0));
		this.data = list;
		this.ordem = ordem;
	}
	async open_modal_filtrar() {
		const modal = await this.modalController.create({
			component: FiltrarLeadComponent,
			componentProps: { situacoes: this.situacoes, ordem: this.ordem },
		});
		await modal.present();
		let result = await modal.onDidDismiss();
		if (result.data) this.ordenar(result.data);
	}
	clickItem(item) {
		item.lida = 1;
		if (this.appService.ambiente == 'consultor') {
			this.appService.navigateUrl(`/lead/interno/${item.id}`);
		} else if (this.appService.ambiente == 'clinica') {
			this.appService.navigateUrl(`/lead/interno/${item.id}`);
		}
	}
	close_search() {
		this.termSearch = "";
		this.searchTerm('');
	}
	async doRefresh(event) {
		this.getLeads(event);
	}
	searchTerm(value) {
		if (value.length != 0) {
			let fields = ['associado'];
			if (this.appService.isEmpty(this.data)) return;
			this.data = this.origindata.filter(x => this.contains(fields, x, value));
		} else {
			this.data = Array.from(this.origindata);
		}
	}
	contains(fields, item, term) {
		let ret = false;
		fields.forEach(prop => {
			if (!this.appService.isEmpty(item[prop])) {
				let it = item[prop].toLowerCase();
				term = term.toLowerCase();
				if (it.includes(term)) return ret = true;
			}
		});
		return ret;
	}
	ngOnDestroy() {
		if (this.subscribeFiltraListaLeads) this.subscribeFiltraListaLeads.unsubscribe();
		if (this.searchTermStream) this.searchTermStream.unsubscribe();
		if (this.subscribeUpList) this.subscribeUpList.unsubscribe();
	}
	async backFunction() {
		await this.appService.navigateUrl(`${this.appService.ambiente}`);
	}
}