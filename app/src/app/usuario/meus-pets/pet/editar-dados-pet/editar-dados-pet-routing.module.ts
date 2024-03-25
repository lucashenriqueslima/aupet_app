import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditarDadosPetPage } from './editar-dados-pet.page';

const routes: Routes = [
  {
    path: '',
    component: EditarDadosPetPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditarDadosPetPageRoutingModule {}
