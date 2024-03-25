import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AppService } from './../../services/app.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-lista-doacao',
  templateUrl: './lista-doacao.page.html',
  styleUrls: ['./lista-doacao.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ListaDoacaoPage implements OnInit {

  ongs;
  constructor(
    public appService: AppService,
    public route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.getOngs();

  }
  async getOngs(){
    this.ongs = await this.appService.httpGet(`aupet/getOngs`);
  }

  interno(id){
    this.appService.navigateUrl(`${this.appService.ambiente}/doar/${id}`);
  }

}
