import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PlanoCancelamentoPage } from './plano-cancelamento.page';

const routes: Routes = [
  {
    path: '',
    component: PlanoCancelamentoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlanoCancelamentoPageRoutingModule {}
