import { Component, OnInit , ViewEncapsulation } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subject, Subscription } from 'rxjs';
import { AppService } from 'src/app/services/app.service';
import { Keyboard } from '@awesome-cordova-plugins/keyboard/ngx';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-mensalidades',
  templateUrl: './mensalidades.page.html',
  styleUrls: ['./mensalidades.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MensalidadesPage implements OnInit {
  tab = 0 ;
  mensalidades: any = [];
  pagamentos;
  dados;
  constructor(
    public modalController: ModalController,
		public appService: AppService,
		public route: ActivatedRoute,
  ) { }

  async ngOnInit() {
    await this.getAssinatura();
  }

  async getAssinatura(){
    this.dados = await this.appService.httpGet(`associado/getAssinatura/${this.appService.user.associado.id}/${this.route.snapshot.params.id_pet}`);
    this.pagamentos = await this.appService.httpGet(`pagamentos/listaAssinaturaPagamentos/${this.dados.assinatura.external_reference}`);

    this.pagamentos.forEach(pagamento => {
      let mensalidade = {
        data_fatura: pagamento.date_approved,
        descricao: pagamento.description.split('-')[1],
        valor_mensalidade: pagamento.transaction_amount,
        status_fatura: 'recebida'
      }

      this.mensalidades.push(mensalidade);
    });

    await this.getMensalidades();
  }

  async getMensalidades(){
      let next_payment = await this.appService.httpGet(`pagamentos/buscarPagamentosAssinatura/${this.route.snapshot.params.id_assinatura}`);
      if(!next_payment.message){
        let prox_mensalidade = {
          data_fatura: next_payment.proxima_fatura,
          descricao: next_payment.titulo.split('-')[1],
          valor_mensalidade:  next_payment.next_payment_value,
          status_fatura: 'aberto'
        }
        this.mensalidades.push(prox_mensalidade);
      }

      this.mensalidades.reverse();
  }

  backFunction() {
    window.history.back();
  }

   
}
