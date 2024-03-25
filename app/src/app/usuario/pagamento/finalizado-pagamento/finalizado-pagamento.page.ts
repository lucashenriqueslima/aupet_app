import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'app-finalizado-pagamento',
  templateUrl: './finalizado-pagamento.page.html',
  styleUrls: ['./finalizado-pagamento.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FinalizadoPagamentoPage implements OnInit {

  constructor(
    public route: ActivatedRoute,
    public appService: AppService,
  ) { }

  ngOnInit() {
  }

  verPet(){
    this.appService.events.upAssciadoPetDetalhes.emit();
    this.appService.navigateUrl(`${this.appService.ambiente}/meus-pets/pet/${this.route.snapshot.params.id_pet}`);
  }

}
