import { Router } from '@angular/router';
import { AppService } from './../../services/app.service';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
@Component({
  selector: 'app-cancelar-agendamento',
  templateUrl: './cancelar-agendamento.component.html',
  styleUrls: ['./cancelar-agendamento.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CancelarAgendamentoComponent implements OnInit {

  motivos;
  load;
  data: any = {};
  constructor(
    public modalCtrl: ModalController,
    public appService: AppService, 
    private router: Router, 
    public navParams: NavParams,
  ){ }

  ngOnInit(){
    this.selectMotivos();
  }

  dismiss() {
    this.modalCtrl.dismiss({
      'dismissed': true
    });
  }
  async selectMotivos() {
		let data = await this.appService.httpGet(`getMotivosCancelamento`);
    this.motivos = data.motivos;
	}

  async cancelar(){
    try {
      this.load = true;
      if(!this.data.id_motivo || this.data.id_motivo == "undefined") return this.appService.showAlert(null, 'Informe o Motivo do Cancelamento');
      this.data.id_agendamento = this.navParams.data.id_agendamento;
      this.data.id_especialidade = this.navParams.data.id_especialidade;

      await this.appService.httpPut('clinica/cancelaAgendamento', this.data);
      this.appService.showToast('Dados alterados com sucesso', 3000);
      await this.appService.navigateUrl('clinica/agendamentos');
      await this.modalCtrl.dismiss();
      window.location.reload();
    } catch (e) {
      this.appService.errorHandler(e);
    } finally {
      this.load = false;
    }
   }

}
