import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DadosPagamentoPage } from './dados-pagamento.page';

const routes: Routes = [
  {
    path: '',
    component: DadosPagamentoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DadosPagamentoPageRoutingModule {}
