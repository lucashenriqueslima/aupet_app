import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CartaoDoacaoPage } from './cartao-doacao.page';

const routes: Routes = [
  {
    path: '',
    component: CartaoDoacaoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CartaoDoacaoPageRoutingModule {}
