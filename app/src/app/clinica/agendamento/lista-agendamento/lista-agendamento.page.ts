import { __core_private_testing_placeholder__, async } from '@angular/core/testing';
import { Keyboard } from '@awesome-cordova-plugins/keyboard/ngx';
import { AppService } from '../../../services/app.service';
import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
import { FiltrarAgendamentoComponentComponent } from '../../../modal/filtrar-agendamento-component/filtrar-agendamento-component.component';
@Component({
  selector: 'app-lista-agendamento',
  templateUrl: './lista-agendamento.page.html',
  styleUrls: ['./lista-agendamento.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ListaAgendamentoPage implements OnInit {

  tab = 0;
  origindata;
  subscribeFiltraListaLeads;
  data; 
  termSearch;
  searchTermStream = new Subject<any>();
  constructor(
        public keyboard: Keyboard,
		public modalController: ModalController,
		public appService: AppService,
		public router: ActivatedRoute,
  ){ }

  ngOnInit() {
    this.subscribeFiltraListaLeads = this.appService.events.filtraListaLeads.subscribe(() => this.filter());
    this.getAgendamentos(); 
  }

  mudar_tab($i){
    this.tab = $i;
  }

  async getAgendamentos(ev = null) {   
    let finaly = () => { ev && ev.target.complete() };
		this.appService.httpGetOffFirst(`clinica/agendamentos`)
			.pipe(finalize(finaly))
			.subscribe(data => { this.origindata = Array.from(data.agendamentos); this.filter(); console.log(this.origindata) }, this.appService.errorHandler);
			
	 }

   async open_modal_filtrar() {
      const modal = await this.modalController.create({
        component: FiltrarAgendamentoComponentComponent,
        componentProps:{},
      });
      await modal.present();
  	}

   close_search(value) {
		this.termSearch = value;
		if (this.termSearch && this.termSearch != '') this.searchTerm(this.termSearch);
		else this.searchTerm('');
	 }


  searchTerm(value) {
		if (value.length != 0) {
			let fields = ['pet'];
			if (this.appService.isEmpty(this.data)) return;
			this.data = this.origindata.filter(x => this.contains(fields, x, value));
		} else {
			this.data = Array.from(this.origindata);
		}
	}

  filter() {
		 this.data = Array.from(this.origindata);
		 if (this.termSearch && this.termSearch != '') return this.searchTerm(this.termSearch);
		 if (!location.href.split('?')[1]) return;
		 let filtros = [];
		 let params = new URLSearchParams(location.href.split('?')[1]);
     let status = params.get('status');
     if (status) filtros.push(`x.status == '${status}'`);
	   let query = 'x => ' + filtros.reduce((a, b) => `(${a}) && (${b})`);
	   this.data = this.data.filter(eval(query));
	}

  contains(fields, item, term) {
		let ret = false;
		fields.forEach(prop => {
			if (!this.appService.isEmpty(item[prop])) {
				let it = item[prop].toLowerCase();
				term = term.target.value.toLowerCase();
				if (it.includes(term)) return ret = true;
			}
		});
		return ret;
	}

   backFunction() {
		window.history.back();
	}

}
