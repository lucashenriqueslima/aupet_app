import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InfoAdicionaisPage } from './info-adicionais.page';

const routes: Routes = [
  {
    path: '',
    component: InfoAdicionaisPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InfoAdicionaisPageRoutingModule {}
