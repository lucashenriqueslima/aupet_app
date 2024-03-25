import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DadosDoacaoPage } from './dados-doacao.page';

const routes: Routes = [
  {
    path: '',
    component: DadosDoacaoPage
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DadosDoacaoPageRoutingModule {}
