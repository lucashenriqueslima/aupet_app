import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InternoAgendamentoPage } from './interno-agendamento.page';

const routes: Routes = [
  {
    path: '',
    component: InternoAgendamentoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InternoAgendamentoPageRoutingModule {}
