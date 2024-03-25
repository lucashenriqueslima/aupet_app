import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AppService } from 'src/app/services/app.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-dados-doacao',
  templateUrl: './dados-doacao.page.html',
  styleUrls: ['./dados-doacao.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DadosDoacaoPage implements OnInit {

  dados: any = {};
  ong: any = {};
  constructor(
    public route: ActivatedRoute,
    public appService: AppService,
  ){ }
  async ngOnInit() {
    this.getOng();
  }
  async getDados(){
        try {

            if(!this.dados.nome) throw 'Informe o Nome do Doador';
            else if (!this.dados.cpf) throw 'Informe o CPF do Doador';
            else if (!this.appService.validaCPF(this.dados.cpf)) throw 'Informe um CPF válido';
            else if (!this.dados.email) throw 'Informe o Email do Doador';
            else if (!this.dados.telefone) throw 'Informe o Telefone do Doador';
            if(this.dados.transactionAmount == 0){ 
                if(this.dados.transactionAmount2){
                  this.dados.transactionAmount = this.dados.transactionAmount2;
                }else{
                  throw 'Informe o Valor da Doação';
                }
            }
            this.dados.ong = this.ong.nome;
            this.dados.id_ong = this.ong.id;
            await this.appService.storage.set('dataDoacao', this.dados);
            this.appService.dataDoacao = this.dados;
            if(this.dados.forma == 1){
              this.appService.navigateUrl(`${this.appService.ambiente}/doar/${this.route.snapshot.params.id}/pagamento/cartao-doacao`);
            }else if(this.dados.forma == 2){
              this.appService.navigateUrl(`${this.appService.ambiente}/doar/${this.route.snapshot.params.id}/pagamento/boleto-doacao`);  
            }else{
              throw 'Escolha a Forma de Pagamento';
            } 
          } catch (e) {
            this.appService.errorHandler(e);
          }
  }

  async getOng(){
    let dados;
    dados = await this.appService.httpGet('aupet/getOng/' + this.route.snapshot.params.id);
    this.ong = dados.ong;
  } 

  selectCampanha(id){
    if(this.ong.campanhas.length > 0) this.dados.campanha = this.ong.campanhas.find(x => x.id == id).nome;
    else this.dados.campanha = 'Sem Campanha';
  }

}
