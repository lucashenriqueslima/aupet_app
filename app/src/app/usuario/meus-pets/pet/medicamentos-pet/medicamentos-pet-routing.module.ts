import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MedicamentosPetPage } from './medicamentos-pet.page';

const routes: Routes = [
  {
    path: '',
    component: MedicamentosPetPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MedicamentosPetPageRoutingModule {}
