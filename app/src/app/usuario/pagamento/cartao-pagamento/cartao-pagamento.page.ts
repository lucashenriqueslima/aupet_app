import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AppService } from 'src/app/services/app.service';
import { ActivatedRoute } from '@angular/router';
import { NgxMercadopagoService } from 'ngx-mercadopago';
import { LoadingController } from '@ionic/angular';
@Component({
  selector: 'app-cartao-pagamento',
  templateUrl: './cartao-pagamento.page.html',
  styleUrls: ['./cartao-pagamento.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CartaoPagamentoPage implements OnInit {
  dados: any={};
  loading;
  cardToken;
  pet: any = {};
  plano;
  assinatura;
  new = 0;
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

  async ngOnInit(){
    await this.ngxMpService.initialize();
    this.loading = await this.loadingCtrl.create({ message: 'Carregando ...' });
    await this.getAssinatura();
    if(this.route.snapshot.params.id_pet) await this.getPet();
    if(this.route.snapshot.params.id_plano) await this.getPlano();
  }

  async getAssinatura() { 
	 let dados = await this.appService.httpGet(`associado/getAssinatura/${this.appService.user.associado.id}/${this.route.snapshot.params.id_pet}`);
   this.assinatura = dados.assinatura;
     if(this.assinatura){
        this.new = 1 ;
        this.dados.assinatura = this.assinatura.assinatura;
        this.dados.id_assinatura = this.assinatura.id;
        this.dados.application_id = this.assinatura.application_id;
        this.dados.status = this.assinatura.status;
        this.dados.user_id = this.assinatura.user_id;
        this.dados.termo_cartao = 1;
     }
  }
  
  async alterMod(){
    this.dados.cardNumber='';
    this.dados.cardExpirationMonth = '';
    this.dados.cardExpirationYear = '';
    this.dados.termo_cartao = 0;
    this.new = 0 ;
  }

  async createToken(action) {
    try {
      await this.loading.present();
      await this.selecionaPetsPlanoAtivado();

      this.dados.cardholderName = this.dados.cardholderName.replace(/( )$/g,'');

      if(!this.dados.cardNumber)throw 'Informe o Numero do Cartão';
      else if(!this.dados.securityCode) throw 'Informe o CVV do Cartão';
      else if(!this.dados.cardExpirationMonth) throw 'Informe o Mês de Vencimento';
      else if(this.dados.cardExpirationMonth > 12) throw 'Informe um mês valido';
      else if(!this.dados.cardExpirationYear) throw 'Informe o Ano de Vencimento';
      else if(!this.dados.cardholderName) throw 'Informe o Titular do Cartão';
      else if (!this.dados.docNumber) throw 'Informe o CPF do Titular';
      else if(!this.appService.validaCPF(this.dados.docNumber)) throw 'Informe um CPF válido';

      this.dados.docType = 'CPF';

      this.cardToken = await this.ngxMpService.createToken(this.dados).toPromise();
      if(this.cardToken.error) throw 'Ocorreu um erro na Geração do Token dos Dados';

      if (!this.dados.termo_cartao) throw 'Você deve Aceitar os Termos de Uso';
      else if (this.dados.valor == 0) throw 'Você não possui nenhum pet com um plano ativado!';
      
      this.dados.id_associado = this.appService.user.associado.id;
      this.dados.email = this.appService.user.email;
      this.dados.nome = this.appService.user.nome;
      this.dados.cpf = this.appService.user.cpf;
      this.dados.telefone = this.appService.user.telefone;

      this.dados.deviceId = window['MP_DEVICE_SESSION_ID'];
      this.dados.token = this.cardToken.data.id;
      delete this.dados.securityCode;

      this.dados.id_pet = this.route.snapshot.params.id_pet;
      this.dados.id_plano = this.route.snapshot.params.id_plano;

      // console.log(this.dados);

      await this.payment(action);
    } catch (e) {
      await this.appService.errorHandler(e);
    }  finally {
      await this.loadingDimiss();
    }
  }

  async payment(action){
    try {
      switch(action){
        case 'alterar': {
            let res = await this.appService.httpPut('pagamentos/atualizaCartaoAssinatura', this.dados);
            if(res.assinatura) await this.appService.navigateUrl(`${this.appService.ambiente}/finalizado-pagamento/${this.route.snapshot.params.id_pet}`);
            else { 
              await this.appService.errorHandler(res.error || res.message);
            }
          }
          break;

        case 'novo': {
            let res = await this.appService.httpPost('pagamentos/criarAssinatura', this.dados);
            if(res.id_assinatura) await this.appService.navigateUrl(`${this.appService.ambiente}/finalizado-pagamento/${this.route.snapshot.params.id_pet}/novo`); 
            else { 
              await this.appService.errorHandler(res.error || res.message);
            }  
          }
          break;

        case 'alterarValor': {
            let res = await this.appService.httpPut('pagamentos/atualizarValorAssinatura',this.dados);
            if(res.id_assinatura) await this.appService.navigateUrl(`${this.appService.ambiente}/finalizado-pagamento/${this.route.snapshot.params.id_pet}/updateValue`); 
            else { 
              await this.appService.errorHandler(res.error || res.message);
            }  
          }
          break;
      }
    } catch (e) {
      this.appService.errorHandler(e);
    }
  }

  async loadingDimiss() {
		await this.loading.dismiss();
		this.loading = await this.loadingCtrl.create({ message: 'Carregando ...' });
	}

  async getPaymentMethod(){
    try {
      this.dados.cardNumber = this.dados.cardNumber.replace(' ','');
      await this.loading.present();
      let bin = this.dados.cardNumber.substring(0,6);
      const paymentMethod = await this.ngxMpService.getPaymentMethod({ bin: bin }).toPromise();
      this.dados.payment_method_id = paymentMethod.data[0].id;
      if(paymentMethod.data[0].payment_type_id != "credit_card") throw 'O cartão informado é invalido';
      else if(paymentMethod.data[0].payment_type_id == "credit_card") this.dados.payment_type_id = paymentMethod.data[0].payment_type_id; 
    } catch (e) {
      this.appService.errorHandler(e);
    } finally {
      await this.loadingDimiss();
    }
  }

  async selecionaPetsPlanoAtivado(){
    let descricao = []; 
    let valor = [];
    const reducer = (accumulator, currentValue) => accumulator + currentValue;

    descricao.push(`Assinatura AupetHeinstein - Plano ${this.plano[0].titulo} - Pet ${this.pet.nome}`);
    valor.push(this.plano[0].valor); 

    if(descricao.length == 0){
      this.dados.descricao = descricao.toLocaleString();
      this.dados.valor = 0;
    }else{
      this.dados.descricao = descricao.toLocaleString();
      this.dados.valor = valor.reduce(reducer);
    }
  } 

  async getPet(){
    this.appService.httpGetOffFirst(`associado/getPet/${this.route.snapshot.params.id_pet}`)
      .subscribe(data => { this.pet = data; },this.appService.errorHandler);
  }

  async getPlano(){
    this.appService.httpGetOffFirst(`getPlano/${this.route.snapshot.params.id_plano}`)
      .subscribe(data => { this.plano = data; }, this.appService.errorHandler);
  }

}
