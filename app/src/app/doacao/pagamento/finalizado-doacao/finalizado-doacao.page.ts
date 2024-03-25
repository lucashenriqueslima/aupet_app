import { Component, OnInit, ViewEncapsulation } from '@angular/core'
import { AppService } from 'src/app/services/app.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-finalizado-doacao',
  templateUrl: './finalizado-doacao.page.html',
  styleUrls: ['./finalizado-doacao.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FinalizadoDoacaoPage implements OnInit {

  resDoacao;
  constructor(
    public route: ActivatedRoute,
    public appService: AppService,
  ) { }

 async ngOnInit() {
  this.resDoacao = await this.appService.resDoacao;
  }

  async back() {
    await this.appService.delDadosDoacoes();
	}

}
