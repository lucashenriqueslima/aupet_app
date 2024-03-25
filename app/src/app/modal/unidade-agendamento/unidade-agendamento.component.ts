import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NgModule } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { AppService } from '../../services/app.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-unidade-agendamento',
  templateUrl: './unidade-agendamento.component.html',
  styleUrls: ['./unidade-agendamento.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UnidadeAgendamentoComponent implements OnInit {

  public etapa = 'etapa_1';
  
  clinica; 
  pets;
  agendamento: any ={};
  today: string = (new Date).toISOString().substr(0, 10);
  constructor(
    public modalCtrl: ModalController, 
    public navParams : NavParams,
    public appService: AppService,
    private router: Router
  ){
    this.clinica = this.navParams.data.clinica;
    this.pets = this.navParams.data.pets;
   }
  ngOnInit(){
    this.agendamento.id_clinica = this.clinica.id_clinica;
  }

  dismiss() {
    this.modalCtrl.dismiss({
      'dismissed': true
    });
  }
 async proximo_passo(){
   try{
        if(!this.agendamento.id_especialidade) throw "Selecione o Servico "; 
        else if(!this.agendamento.id_pet) throw  "Selecione o Pet";
        else if(!this.agendamento.data) throw  "Selecione a Data";
       // else if(this.agendamento.data < atual) throw "Data Invalida";
        else if(!this.agendamento.hora) throw  "Selecione a hora";

        this.agendamento.id_plano = this.pets.find(x => x.id == this.agendamento.id_pet).id_plano;
        this.agendamento.servico = this.clinica.especialidades.find(x => x.id == this.agendamento.id_especialidade).nome;
        let verifica = await this.appService.httpPost('pet/verificarAgenda', this.agendamento);

          if(verifica){
              throw  verifica;
          }else{  
            this.etapa = 'etapa_2';
          }
        
      }catch (e) {
        this.appService.errorHandler(e);
      } finally {
        
      }
  }
  async confirmar(){
   // debugger
    let response = await this.appService.httpPost('pet/agendar', this.agendamento);
    await this.appService.showSuccess(null,'Foi solicitado o Agendamento Aguarde a Confirmação da Clinica.'); 
    if(response){
      await this.appService.showSuccess(null,'Foi solicitado o Agendamento Aguarde a Confirmação da Clinica.'); 
      this.dismiss();
    } 
   }

}
