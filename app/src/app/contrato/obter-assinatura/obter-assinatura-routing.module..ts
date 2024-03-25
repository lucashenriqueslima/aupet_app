import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ObterAssinaturaPage } from './obter-assinatura.page';

const routes: Routes = [
  {
    path: '',
    component: ObterAssinaturaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ObterAssinaturaPageRoutingModule {}
