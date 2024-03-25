import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'app-termo-de-filiacao',
  templateUrl: './termo-de-filiacao.page.html',
  styleUrls: ['./termo-de-filiacao.page.scss'],
	encapsulation: ViewEncapsulation.None
})
export class TermoDeFiliacaoPage implements OnInit {
  termo: any = {};
  constructor(
    public appService: AppService,
    public route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.getTexto();
  }

  async getTexto(){
    this.appService.httpGetOffFirst(`getTexto/${this.route.snapshot.params.id_plano}`).subscribe(dados =>{
      this.termo = dados.texto
    });
  }

}
