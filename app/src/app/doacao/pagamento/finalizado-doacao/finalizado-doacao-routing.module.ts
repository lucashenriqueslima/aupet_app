import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FinalizadoDoacaoPage } from './finalizado-doacao.page';

const routes: Routes = [
  {
    path: '',
    component: FinalizadoDoacaoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FinalizadoDoacaoPageRoutingModule {}
