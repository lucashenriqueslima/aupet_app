import { Router } from '@angular/router';
import { AppService } from './../../services/app.service';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-dados-cliente-agendamento',
  templateUrl: './dados-cliente-agendamento.component.html',
  styleUrls: ['./dados-cliente-agendamento.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DadosClienteAgendamentoComponent implements OnInit {

  associado;
  constructor(
    public modalCtrl: ModalController,
    public appService: AppService, 
    private router: Router, 
    public navParams: NavParams,
  ) { }

  ngOnInit(){
    this.associado = this.navParams.data.associado;
  }

  dismiss() {
    this.modalCtrl.dismiss({
      'dismissed': true
    });
  }

  async call() {
		setTimeout(() => {
			let tel = this.associado.telefone && this.associado.telefone.replace(/[ ()-]/g, '');
			window.open(`tel:${tel}`, '_system');
		}, 100);
	}
	async whatsapp() {
		setTimeout(() => {
			this.associado.telefone_whats = this.associado.telefone && this.associado.telefone.replace(/[ ()-]/g, '');
			this.associado.telefone_whats = this.associado.telefone_whats.slice(0, 2) + this.associado.telefone_whats.slice(3);
			this.associado.telefone_whats = '55' + this.associado.telefone_whats;
			window.open(`https://api.whatsapp.com/send?phone=${this.associado.telefone_whats}`, '_system');
		}, 100);
	}

}
