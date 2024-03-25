import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AppService } from './../../services/app.service';
import { ActivatedRoute } from '@angular/router';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-plano-cancelamento',
  templateUrl: './plano-cancelamento.page.html',
  styleUrls: ['./plano-cancelamento.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PlanoCancelamentoPage implements OnInit {

  motivos;
  load;
  data: any = {};
  validate = true;
  id_assinatura;
  assinatura;
  loading;
  
  constructor(
    public appService: AppService,
    public route:  ActivatedRoute,
    public loadingCtrl: LoadingController,
  ) { }

  async ngOnInit() {
    this.loading = await this.loadingCtrl.create({ message: 'Carregando ...' });
    this.selectMotivos();
    this.validaMotivo(this.data?.id_motivo);
    this.getAssinatura()
  }

  async selectMotivos() {
		let data = await this.appService.httpGet(`getMotivosArquivamento`);
    this.motivos = data.motivos;
	}

  async cancelarPlano(){
    try {
      this.load = true;
      await this.loading.present();
      if(!this.data.id_motivo || this.data.id_motivo == "undefined") return this.appService.showAlert(null, 'Informe o Motivo do Cancelamento');
      this.data.id_arquivamento = this.data.id_motivo;
      this.data.cancelado_em = new Date().toISOString();
      this.data.delete_at = new Date().toISOString();
      this.data.id_pet = this.route.snapshot.params.id_pet;
      this.data.assinatura = this.assinatura;
      this.data.id_assinatura = this.id_assinatura;

      await this.appService.httpPut('pagamentos/cancelarAssinatura', this.data);
      this.appService.showToast('Assinatura cancelada com sucesso', 3000);
      this.appService.events.upAssciadoPetDetalhes.emit();
      this.appService.navigateUrl(`${this.appService.ambiente}/meus-pets/pet/${this.route.snapshot.params.id_pet}`);
    } catch (e) {
      this.appService.errorHandler(e);
    } finally {
      this.load = false;
      await this.loadingDimiss();
    }
   }

  conhecerPlanos(){
    this.appService.navigateUrl(`${this.appService.ambiente}/planos/${this.route.snapshot.params.id_pet}/${this.route.snapshot.params.id_plano}`);
  }

  validaMotivo(id_motivo){
    if(id_motivo) this.validate = false;
  }

  async getAssinatura(){
    let dados = await this.appService.httpGet(`associado/getAssinatura/${this.appService.user.associado.id}/${this.route.snapshot.params.id_pet}`);
    this.assinatura = dados.assinatura.assinatura;
    this.id_assinatura = dados.assinatura.id;
  }

  async loadingDimiss() {
		await this.loading.dismiss();
		this.loading = await this.loadingCtrl.create({ message: 'Carregando ...' });
	}

}
