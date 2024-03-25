import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CartaoPagamentoPage } from './cartao-pagamento.page';

const routes: Routes = [
  {
    path: '',
    component: CartaoPagamentoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CartaoPagamentoPageRoutingModule {}
