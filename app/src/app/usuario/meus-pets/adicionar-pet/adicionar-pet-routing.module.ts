import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdicionarPetPage } from './adicionar-pet.page';

const routes: Routes = [
  {
    path: '',
    component: AdicionarPetPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdicionarPetPageRoutingModule {}
