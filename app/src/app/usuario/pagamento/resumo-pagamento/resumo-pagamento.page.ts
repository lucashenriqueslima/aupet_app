import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AppService } from 'src/app/services/app.service';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { SelecionarPetComponent } from 'src/app/modal/selecionar-pet/selecionar-pet.component';
@Component({
  selector: 'app-resumo-pagamento',
  templateUrl: './resumo-pagamento.page.html',
  styleUrls: ['./resumo-pagamento.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ResumoPagamentoPage implements OnInit {
  plano : any = {};
  id_pet;
  pets;
  termo_resumo;
  load = false;
  validate = true;

  constructor( 		
    public modalController: ModalController,
    public appService: AppService,
		public route: ActivatedRoute, 
  ) { }

  ngOnInit() {
    this.getPlano();
    this.getPets();
    this.id_pet = this.route.snapshot.params.id_pet;
  }

  public async getPlano(){
    let data = await this.appService.httpGet(`getPlanoPagamento/${this.route.snapshot.params.id_plano}`);
    this.plano = data.plano;
  }

  async getPets(){
    this.appService.httpGetOffFirst(`associado/getPets`).subscribe(data => { 
      if(!this.route.snapshot.params.id_pet) this.pets = data.filter((pet) => { return pet.id_plano == null || pet.classificacao == 'arquivada' });
      else this.pets = data.filter((pet) => { return pet.id == this.route.snapshot.params.id_pet });
    },this.appService.errorHandler);
  }

  changePet(id_pet){
    if(id_pet && this.termo_resumo) this.validate = false; 
    else this.validate = true;
  }

  cadastrarPet(){
    this.appService.navigateUrl(`${this.appService.ambiente}/meus-pets/adicionar-pet/${this.route.snapshot.params.id_plano}`);
  }

  pagamento(){
    this.appService.navigateUrl(`${this.appService.ambiente}/dados-pagamento/${this.id_pet}/${this.route.snapshot.params.id_plano}`);
  }

}
