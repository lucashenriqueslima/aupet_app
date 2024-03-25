import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CriarPropostaPage } from './criar-proposta.page';

const routes: Routes = [
  {
    path: '',
    component: CriarPropostaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CriarPropostaPageRoutingModule {}
