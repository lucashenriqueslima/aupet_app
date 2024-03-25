import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UnidadePage } from './unidade.page';

const routes: Routes = [
  {
    path: '',
    component: UnidadePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UnidadePageRoutingModule {}
