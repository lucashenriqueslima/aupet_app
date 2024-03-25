import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TermoDeFiliacaoPage } from './termo-de-filiacao.page';

const routes: Routes = [
  {
    path: '',
    component: TermoDeFiliacaoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TermoDeFiliacaoPageRoutingModule {}
