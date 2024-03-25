import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FinalizadoPagamentoPage } from './finalizado-pagamento.page';

const routes: Routes = [
  {
    path: '',
    component: FinalizadoPagamentoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FinalizadoPagamentoPageRoutingModule {}
