import { __core_private_testing_placeholder__, async } from '@angular/core/testing';
import { Keyboard } from '@awesome-cordova-plugins/keyboard/ngx';
import { AppService } from '../../../services/app.service';
import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
//MODAL
import { DadosClienteAgendamentoComponent } from './../../../modal/dados-cliente-agendamento/dados-cliente-agendamento.component';
import { CancelarAgendamentoComponent } from './../../../modal/cancelar-agendamento/cancelar-agendamento.component';

import { TratarAgendamentoComponent } from './../../../modal/tratar-agendamento/tratar-agendamento.component';

@Component({
  selector: 'app-interno-agendamento',
  templateUrl: './interno-agendamento.page.html',
  styleUrls: ['./interno-agendamento.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class InternoAgendamentoPage implements OnInit {

  finalizado = false;
  agendamento;
  constructor(
    public keyboard: Keyboard,
    public modalController: ModalController,
    public appService: AppService,
		public route: ActivatedRoute,
  ) { }

  ngOnInit(){
    this.getAgendamento();
  }

  params: any = {};
  data: any = {};

  async open_modal_dados() {
    const modal = await this.modalController.create({
        component: DadosClienteAgendamentoComponent,
        componentProps: { associado: this.agendamento?.associado },
    });
    return await modal.present();
  }

  async open_modal_cancelar() {
    const modal = await this.modalController.create({
        component: CancelarAgendamentoComponent,
        componentProps: { id_agendamento: this.route.snapshot.params.id_agendamento , id_especialidade: this.route.snapshot.params.id_especialidade },
    });
    return await modal.present();
  }

  async open_modal_Tratar() {
    const modal = await this.modalController.create({
        component: TratarAgendamentoComponent,
        componentProps: { agendamento: this.agendamento },
    });
    return await modal.present();
  }



  async getAgendamento() {
		let data = await this.appService.httpGet(`clinica/agendamento/${this.route.snapshot.params.id_agendamento}/especialidade/${this.route.snapshot.params.id_especialidade}`);
    this.agendamento = data.agendamento;
    if(this.agendamento.status_agendamento === 'Concluido' || this.agendamento.status_agendamento === 'Cancelado' ) this.finalizado = true;
	}

  async confirmaAgendamento(){
    this.data.id_agendamento = this.route.snapshot.params.id_agendamento;
    this.data.id_especialidade = this.route.snapshot.params.id_especialidade;
    if(this.agendamento?.status_agendamento == 'Pendente') await this.appService.httpPut('clinica/confirmarAgendamento', this.data);
    await this.appService.showSuccess(null,'Agendamento Confirmado .');
    await this.appService.navigateUrl('clinica/agendamentos');
    window.location.reload(); 
  }

}
