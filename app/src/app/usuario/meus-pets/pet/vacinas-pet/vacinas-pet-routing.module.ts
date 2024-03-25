import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VacinasPetPage } from './vacinas-pet.page';

const routes: Routes = [
  {
    path: '',
    component: VacinasPetPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VacinasPetPageRoutingModule {}
