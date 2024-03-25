import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AppService } from 'src/app/services/app.service';
import { ActivatedRoute } from '@angular/router';
import { NgxMercadopagoService } from 'ngx-mercadopago';
import { ActionSheetController, ModalController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-cartao-doacao',
  templateUrl: './cartao-doacao.page.html',
  styleUrls: ['./cartao-doacao.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CartaoDoacaoPage implements OnInit {

  //paymentMethod;
  issuer;
  cardToken;
  PaymentMethods;
  dados : any = {};
  dadosDoacao;
  load;
  loading;
  constructor(
    public route: ActivatedRoute,
    public appService: AppService,
    private ngxMpService: NgxMercadopagoService,
    public loadingCtrl: LoadingController,
  ) {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://www.mercadopago.com/v2/security.js';
    document.body.appendChild(script); 

  }

  async ngOnInit() {
    await this.ngxMpService.initialize();
    this.dadosDoacao = await this.appService.dataDoacao;
    this.loading = await this.loadingCtrl.create({ message: 'Carregando ...' });
  }

   async getPaymentMethods() {

    this.PaymentMethods = await this.ngxMpService.getPaymentMethods();
    //  console.log(this.PaymentMethods);
  }


    async getPaymentMethod(){
      try {
        this.dados.cardNumber = this.dados.cardNumber.replace(' ','');
        await this.loading.present();
        let bin = this.dados.cardNumber.substring(0,6);
        const paymentMethod = await this.ngxMpService.getPaymentMethod({
            bin: bin
        }).toPromise();
       this.dados.payment_method_id = paymentMethod.data[0].id;
        if(paymentMethod.data[0].payment_type_id != "credit_card") throw 'O cartão informado é invalido';
        else if(paymentMethod.data[0].payment_type_id == "credit_card") this.dados.payment_type_id = paymentMethod.data[0].payment_type_id; 
      } catch (e) {
        this.appService.errorHandler(e);
      } finally {
        await this.loadingDimiss();
      }
  }

  async getInstallments() {
    let bin = this.dados.cardNumber.substring(0,6);
       let issuer = await this.ngxMpService.getInstallments({
         payment_type_id: this.dados.payment_type_id,
         payment_method_id: this.dados.payment_method_id,
         bin: bin 
       }).toPromise();
       this.dados.issuer_id = issuer.data[0].issuer.id; 
   }

  async createToken() {
    try {
      await this.loading.present();
      this.getInstallments();
      if(!this.dados.cardNumber)throw 'Informe o Numero do Cartão';
      else if(!this.dados.cardExpirationMonth) throw 'Informe o Mês de Vencimento';
      else if(!this.dados.cardExpirationYear) throw 'Informe o Ano de Vencimento';
      else if(!this.dados.securityCode) throw 'Informe o CVV do Cartão';
      else if(!this.dados.cardholderName) throw 'Informe o Titular do Cartão';
      else if (!this.dados.docNumber) throw 'Informe o CPF do Titular';
      else if (!this.appService.validaCPF(this.dados.docNumber)) throw 'Informe um CPF válido';
      this.dados.docType = 'CPF';
      this.dados.description = `Doação para ong ${this.dadosDoacao.ong} Campanha ${this.dadosDoacao.campanha} `;
      //parcelas  
      this.dados.installments = '1';
      this.dados.email = this.dadosDoacao.email;
      this.dados.nome = this.dadosDoacao.nome;
      this.dados.cpf = this.dadosDoacao.cpf;
      this.dados.telefone = this.dadosDoacao.telefone;
      this.dados.transactionAmount = this.dadosDoacao.transactionAmount;
      this.dados.id_ong = this.dadosDoacao.id_ong;
      this.dados.id_campanha = this.dadosDoacao.id_campanha;
      this.cardToken = await this.ngxMpService.createToken(this.dados).toPromise();
      if(!this.cardToken.data) throw 'Ocorreu um erro na verificação dos Dados';
      this.dados.token = this.cardToken.data.id;
      this.dados.deviceId = window['MP_DEVICE_SESSION_ID'];
     // console.log(this.cardToken);
      await this.payment();
    } catch (e) {
      this.appService.errorHandler(e);
    }  finally {
      await this.loadingDimiss();
    }
  }

  async payment(){
      try{
        let res = await this.appService.httpPost('pagamentos/criarPagamento', this.dados);
        if(res.status){
            await this.appService.storage.set('resDoacao', res);
            this.appService.resDoacao = res;
           await this.appService.navigateUrl(`${this.appService.ambiente}/doar/${this.route.snapshot.params.id}/pagamento/finalizado-doacao`);
          }else{
           this.appService.errorHandler(res.message);
          }
      } catch (e) {
        this.appService.errorHandler(e);
      }    
  }

  async loadingDimiss() {
		await this.loading.dismiss();
		this.loading = await this.loadingCtrl.create({ message: 'Carregando ...' });
	}

}
