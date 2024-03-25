import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AppService } from 'src/app/services/app.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
@Component({
  selector: 'app-extrato',
  templateUrl: './extrato.page.html',
  styleUrls: ['./extrato.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ExtratoPage implements OnInit {

  extratos;
  constructor(
    public appService: AppService,
  ) { }

  ngOnInit() {
    this.getLeads();
  }

  async getLeads(ev = null) {
	let data = await this.appService.httpGet(`proposta/propostas`);
  this.extratos = data.leads.filter((ext) => { return ext.activated_at != null });    
	}

}
