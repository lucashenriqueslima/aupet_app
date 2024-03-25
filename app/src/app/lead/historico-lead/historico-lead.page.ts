import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AppService } from './../../services/app.service';
import { ActivatedRoute } from '@angular/router';
@Component({
	selector: 'app-historico-lead',
	templateUrl: './historico-lead.page.html',
	styleUrls: ['./historico-lead.page.scss'],
	encapsulation: ViewEncapsulation.None
})
export class HistoricoLeadPage {
	data: any = {};
	historico = [];
	constructor(
		public route: ActivatedRoute,
		public appService: AppService,
	) { }
	async ngOnInit() {
		let res = await this.appService.httpGet(`proposta/historico/${this.route.snapshot.params.id_lead}`);
		this.historico = res.historico;
	}

}
