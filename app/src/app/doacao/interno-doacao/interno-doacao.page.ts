import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AppService } from 'src/app/services/app.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-interno-doacao',
  templateUrl: './interno-doacao.page.html',
  styleUrls: ['./interno-doacao.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class InternoDoacaoPage implements OnInit {

  ong: any = {};
  images=[];
  constructor(
    public route: ActivatedRoute,
    public appService: AppService,
  ){  
      this.getOng();
      this.getImagesOng();
   }

  ngOnInit(){}
  
  async getOng(){
    let dados;
    dados = await this.appService.httpGet('aupet/getOng/' + this.route.snapshot.params.id);
    this.ong = dados.ong;
  } 
  async getImagesOng(){
    this.images = await this.appService.httpGet('aupet/getImageOng/' + this.route.snapshot.params.id);
  }

  voltar(){
    window.history.back();
  }  
  

  // doar(id){
  //   this.appService.navigateUrl(`${this.appService.ambiente}/pagamento/dados-doacao/${id}`);
  // }


}
