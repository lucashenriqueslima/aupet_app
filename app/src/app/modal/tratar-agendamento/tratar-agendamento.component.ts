import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NgModule } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { AppService } from '../../services/app.service';
import { Router } from '@angular/router';
import { Console } from 'console';


@Component({
  selector: 'app-tratar-agendamento',
  templateUrl: './tratar-agendamento.component.html',
  styleUrls: ['./tratar-agendamento.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TratarAgendamentoComponent implements OnInit {

  agendamento;
  data: any ={};
  today: string = (new Date).toISOString().substr(0, 10);
  constructor(
    public modalCtrl: ModalController, 
    public navParams : NavParams,
    public appService: AppService,
    private router: Router
  ) { 
    this.agendamento = this.navParams.data.atendimento;
  }

  async ngOnInit(){
    // console.log(this.agendamento);
  }

  async salvar(){
    try{
    this.data.id_especialidade = this.agendamento.id_especialidade;
    this.data.id_agendamento = this.agendamento.id_agendamento;
    await this.appService.httpPut('clinica/agendamentoRealizado', this.data);
    await this.appService.showSuccess(null,'Atendimento Realizado.'); 
    await this.appService.navigateUrl('clinica/agendamentos');
    await this.modalCtrl.dismiss();
    window.location.reload();
  }catch (e) {
    this.appService.errorHandler(e);
  } finally {
    
  }

  }

async dismiss() {
    this.modalCtrl.dismiss({
      'dismissed': true
    });
  }
  

}
