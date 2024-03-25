import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'app-excluir-proposta',
  templateUrl: './excluir-proposta.component.html',
  styleUrls: ['./excluir-proposta.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ExcluirPropostaComponent implements OnInit {

  constructor(
    public modalCtrl: ModalController,
		public navParams: NavParams,
		public appService: AppService,
  ) { }

  ngOnInit() {}

  dismiss() {
    this.modalCtrl.dismiss({
      'dismissed': true
    });
  }

  async excluirPet(){
    await this.appService.httpPut(`pet/excluir`,{ id_pet: this.navParams.data.pet.id_pet, assinatura: null });
    this.appService.showToast('Pet excluido com sucesso', 3000);
    window.location.reload();
    
  }

}
