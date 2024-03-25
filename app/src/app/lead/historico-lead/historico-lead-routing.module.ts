import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HistoricoLeadPage } from './historico-lead.page';

const routes: Routes = [
  {
    path: '',
    component: HistoricoLeadPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HistoricoLeadPageRoutingModule {}
