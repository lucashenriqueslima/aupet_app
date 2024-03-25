import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { UnidadeAgendamentoComponent } from './../../../modal/unidade-agendamento/unidade-agendamento.component';
import { AppService } from 'src/app/services/app.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-unidade',
  templateUrl: './unidade.page.html',
  styleUrls: ['./unidade.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UnidadePage implements OnInit {

  clinica: any = {} ;
  pets ;
  numero_de_pets;
  assinatura: any = {};
	statusAssinatura;
  constructor(
    public appService: AppService,
    public modalController: ModalController,
    public route: ActivatedRoute,
  ){
      this.getClinica();
      this.getPets();
      this.getAssinatura();
   }
  ngOnInit() {
  }

  params: any = {};
  async open_modal_agendamento() {
    let pets = this.pets.filter((pet) => { return pet.id_plano != undefined  && pet.classificacao == 'ativada' });
    const modal = await this.modalController.create({
        component: UnidadeAgendamentoComponent,
        componentProps: { clinica: this.clinica , pets: pets },
    });

    if(pets.length > 0){
      if(this.assinatura == null){
        try {
          await this.appService.navigateUrl(`${this.appService.ambiente}/cartao-pagamento`);
          throw 'Verifique os dados de pagamento da assinatura!';
        } catch (error) {
          this.appService.errorHandler(error);
        }			
      } else {
        if(this.assinatura != null && !this.statusAssinatura){
          try {
            // await this.appService.navigateUrl(`${this.appService.ambiente}/cartao-pagamento`);		
            throw 'Pagamento de Assinatura Atrasado ou ainda não creditado!Tente novamente mais tarde!';
          } catch (error) {
            this.appService.errorHandler(error);
          }
        }else{
          return await modal.present();
        }
      }	
    }else{
      try {
        throw 'Você não possui nenhum pet com um plano ativado!';
      } catch (error) {
        this.appService.errorHandler(error);
      }
    }

   
  }

 async getClinica(){
      let  dados = await this.appService.httpGet('associado/clinica/'+ this.route.snapshot.params.id);
      this.clinica = dados.clinica;
  }

  async getPets(){
    this.appService.httpGetOffFirst(`associado/getPets`).subscribe(data =>{ this.pets = data;
    this.numero_de_pets = this.pets.length;
    },this.appService.errorHandler);
  }
  async getAssinatura(){
		let dados = await this.appService.httpGet(`associado/getAssinatura/${this.appService.user.associado.id}`);
		this.assinatura = dados.assinatura;
		if(this.assinatura) { 
			let pagamentos = await this.appService.httpGet(`pagamentos/buscarPagamentosAssinatura/${this.assinatura.assinatura}`); 
			this.statusAssinatura = pagamentos.payment_status;
		}
	}

  backFunction() {
		 window.history.back();
  }


}
