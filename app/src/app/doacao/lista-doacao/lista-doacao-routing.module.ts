import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListaDoacaoPage } from './lista-doacao.page';

const routes: Routes = [
  {
    path: '',
    component: ListaDoacaoPage
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListaDoacaoPageRoutingModule {}
