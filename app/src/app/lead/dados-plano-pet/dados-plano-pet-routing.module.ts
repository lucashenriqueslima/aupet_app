import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DadosPlanoPetPage } from './dados-plano-pet.page';

const routes: Routes = [
  {
    path: '',
    component: DadosPlanoPetPage
  },
  {
    path: 'lead/dados-pet/:id',
    component: DadosPlanoPetPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DadosPlanoPetPageRoutingModule {}
