import { Component, OnInit,ViewEncapsulation } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { AppService } from './../../services/app.service';


@Component({
  selector: 'app-arquivar-proposta',
  templateUrl: './arquivar-proposta.component.html',
  styleUrls: ['./arquivar-proposta.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ArquivarPropostaComponent implements OnInit {

  motivos;
  load;
  data: any = {};

  constructor(
    public modalCtrl: ModalController,
    public appService: AppService, 
    public navParams: NavParams,

  ) { }

  ngOnInit() {
    this.selectMotivos();
  }

  dismiss() {
    this.modalCtrl.dismiss({
      'dismissed': true
    });
  }

  async selectMotivos() {
		let data = await this.appService.httpGet(`getMotivosArquivamento`);
    this.motivos = data.motivos;
	}

  async arquivar(){
    try {
      this.load = true;
      if(!this.data.id_motivo || this.data.id_motivo == "undefined") return this.appService.showAlert(null, 'Informe o Motivo do Cancelamento');
      this.data.id_arquivamento = this.data.id_motivo;
      this.data.classificacao = 'arquivada';
      this.data.arquivado_em = new Date().toISOString();
      this.data.id = this.navParams.data.pet.id;

      await this.appService.httpPut('pet/arquivar', this.data);
      this.appService.showToast('Pet arquivado com sucesso', 3000);
      window.location.reload();
      this.modalCtrl.dismiss();
    } catch (e) {
      this.appService.errorHandler(e);
    } finally {
      this.load = false;
    }
   }

}
