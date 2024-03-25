import { AppService } from './../../services/app.service';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-filtrar-agendamento-component',
  templateUrl: './filtrar-agendamento-component.component.html',
  styleUrls: ['./filtrar-agendamento-component.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FiltrarAgendamentoComponentComponent implements OnInit {

  status = "";
  constructor(
    public modalCtrl: ModalController,
    public appService : AppService ,
    public navParams : NavParams ,
  ) { }

  ngOnInit() {

   this.checkFiltros(); 
  }

  checkFiltros() {
		if (!location.href.split('?')[1]) return;
		let params = new URLSearchParams(location.href.split('?')[1]);
		let status = params.get('status');
		if (status) this.status = status;
	}


  async filtrar_leads() {
     this.limparFiltros();
		 let query = '?status=' + this.status;
		 window.history.replaceState(null, '', location.hash + query);
		 this.modalCtrl.dismiss(this.status);
		 this.appService.events.filtraListaLeads.emit();
	}

  dismiss() {
    this.modalCtrl.dismiss({
      'dismissed': true
    });
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
