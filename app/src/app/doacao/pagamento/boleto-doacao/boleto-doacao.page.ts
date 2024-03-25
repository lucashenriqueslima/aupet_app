import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AppService } from 'src/app/services/app.service';
import { ActivatedRoute } from '@angular/router';
import { NgxMercadopagoService } from 'ngx-mercadopago';
import { ActionSheetController, ModalController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-boleto-doacao',
  templateUrl: './boleto-doacao.page.html',
  styleUrls: ['./boleto-doacao.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BoletoDoacaoPage implements OnInit {
  dadosDoacao;
  loading;
  boleto;
  data: any = {};
  constructor(
    public route: ActivatedRoute,
    public appService: AppService,
    //private ngxMpService: NgxMercadopagoService,
    public loadingCtrl: LoadingController,
  ) { }

 async ngOnInit(){
  this.dadosDoacao = await this.appService.dataDoacao;
  this.loading = await this.loadingCtrl.create({ message: 'Carregando ...' });
  this.geraBoleto();
  }

  async geraBoleto(){
     try{
      await this.loading.present();
      this.data.id_ong = this.dadosDoacao.id_ong;
      this.data.id_campanha = this.dadosDoacao.id_campanha;
      this.data.first_name = this.dadosDoacao.nome.split(" ")[0];
      this.data.last_name = this.dadosDoacao.nome.split(" ")[1];
      this.data.docType = 'CPF';
      this.data.docNumber = this.dadosDoacao.cpf;
      this.data.nome = this.dadosDoacao.nome;
      this.data.cpf = this.dadosDoacao.cpf;
      this.data.email = this.dadosDoacao.email;
      this.data.telefone = this.dadosDoacao.telefone;
      this.data.description = `Doação para ong ${this.dadosDoacao.ong} Campanha ${this.dadosDoacao.campanha} `;
      this.data.transactionAmount = this.dadosDoacao.transactionAmount;
      this.boleto = await this.appService.httpPost('pagamentos/criarPagamentoViaBoleto', this.data);

      // console.log(this.boleto);

      } catch (e) {
        this.appService.errorHandler(e);
        
      } finally {
        await this.loadingDimiss();
      }
  }

  async loadingDimiss() {
		await this.loading.dismiss();
		this.loading = await this.loadingCtrl.create({ message: 'Carregando ...' });
	}

 async baixarBoleto(){

  await this.appService.storage.set('resDoacao', this.boleto);
  this.appService.resDoacao = this.boleto;
  await window.open(this.boleto.boleto_pdf, '_blank');
 await this.appService.navigateUrl(`${this.appService.ambiente}/doar/${this.route.snapshot.params.id}/pagamento/finalizado-doacao`);
  }

}
