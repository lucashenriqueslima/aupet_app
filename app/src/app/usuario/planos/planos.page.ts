import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Location } from '@angular/common';
import { AppService } from 'src/app/services/app.service';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-planos',
  templateUrl: './planos.page.html',
  styleUrls: ['./planos.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PlanosPage implements OnInit {
  planos = [];
  beneficios = [];
  load;
	data : any = {};
  pet: any ={};
  planosCores = [];
  constructor( 
    private location: Location,
		public appService: AppService,
		public route: ActivatedRoute,
    public modalController: ModalController,
   
    ) { 
      this.data.pet = {
        id: window.location.toString().split('/')[7]
      } 
      this.planosCores[0] = 'bronze';
      this.planosCores[1] ='prata';
      this.planosCores[2] ='ouro';
     }

  ngOnInit() {
    this.getPlanos();
    this.getBeneficios();
    if(this?.data?.pet?.id != undefined){
      this.getPet();
    }
  }

  public plano_selected = 0;

  public change_plano(i){
    this.plano_selected = i;
  }

  public async getPlanos(){
    this.planos  = await this.appService.httpGet(`getPlanos`);
    this.planos.forEach(plano => plano.beneficios = plano.beneficios.split(','));
    this.planos.forEach((plano,index) => { if(this.route.snapshot.params.id_plano == plano.id) this.plano_selected = index });
  }

  public async getBeneficios(){
    this.beneficios  = await this.appService.httpGet(`getBeneficios`);
  }

  public planoBeneficio(plano, beneficio){
    let benef = plano.beneficios.find(e => e == beneficio.id)
    if(benef == undefined) return 'false'; else return 'true';
  }

  async getPet(){
    this.pet = await this.appService.httpGet(`pet/getPet/${this.data.pet.id}`);
  }

  assinarPlano(plano_id){
    if(this.route.snapshot.params.id_pet) this.appService.navigateUrl(`${this.appService.ambiente}/plano/${plano_id}/${this.route.snapshot.params.id_pet}`);
    else this.appService.navigateUrl(`${this.appService.ambiente}/plano/${plano_id}`);
  }

  hasPlano(id_plano){
    if(this.route.snapshot.params.id_plano == id_plano) return true;
    else return false;
  }

}
