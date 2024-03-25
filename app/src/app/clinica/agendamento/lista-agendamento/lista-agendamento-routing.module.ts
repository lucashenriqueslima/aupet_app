import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListaAgendamentoPage } from './lista-agendamento.page';

const routes: Routes = [
  {
    path: '',
    component: ListaAgendamentoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListaAgendamentoPageRoutingModule {}
