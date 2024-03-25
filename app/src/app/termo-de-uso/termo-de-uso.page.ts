import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'app-termo-de-uso',
  templateUrl: './termo-de-uso.page.html',
  styleUrls: ['./termo-de-uso.page.scss'],
	encapsulation: ViewEncapsulation.None
})
export class TermoDeUsoPage implements OnInit {

  termo: any = {};
  constructor(
    public appService: AppService,
  ) { }

  ngOnInit() {
    this.getTexto();
  }

  async getTexto(){
    this.appService.httpGetOffFirst(`getTermo/1`).subscribe(dados =>{
      this.termo = dados.texto
    });
  }


}
