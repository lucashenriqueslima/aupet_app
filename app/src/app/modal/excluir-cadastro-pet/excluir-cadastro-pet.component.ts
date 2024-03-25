import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoadingController, ModalController, NavParams } from '@ionic/angular';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'app-excluir-cadastro-pet',
  templateUrl: './excluir-cadastro-pet.component.html',
  styleUrls: ['./excluir-cadastro-pet.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ExcluirCadastroPetComponent implements OnInit {

  assinatura;
  havePlan = false;
  loading;
  constructor(
    public modalCtrl: ModalController,
		public navParams: NavParams,
		public appService: AppService,
    public route:  ActivatedRoute,
    public loadingCtrl: LoadingController,
  ) { }

  async ngOnInit() {
    this.loading = await this.loadingCtrl.create({ message: 'Carregando ...' });
    this.getAssinatura();
  }

  async getAssinatura(){
    let dados = await this.appService.httpGet(`associado/getAssinatura/${this.appService.user.associado.id}/${this.navParams.data.pet.id}`);
    if(dados.assinatura) this.havePlan = true;
		this.assinatura = dados.assinatura;
  }

  async excluirPet(){
    try {
      await this.loading.present();
      await this.appService.httpPut(`pet/excluir`,{ id_pet: this.navParams.data.pet.id, assinatura: this.assinatura });

      this.appService.showToast('Assinatura cancelada com sucesso', 3000);
      this.appService.navigateUrl(`${this.appService.ambiente}/meus-pets`);
      this.modalCtrl.dismiss();
    } catch (error) {
      this.appService.errorHandler(error);
    }finally {
      await this.loadingDimiss();
    }
  }

  dismiss() {
		this.modalCtrl.dismiss({
			'dismissed': true
		});
	}

  async loadingDimiss() {
		await this.loading.dismiss();
		this.loading = await this.loadingCtrl.create({ message: 'Carregando ...' });
	}
}
