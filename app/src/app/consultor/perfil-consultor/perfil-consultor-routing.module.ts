import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PerfilConsultorPage } from './perfil-consultor.page';

const routes: Routes = [
  {
    path: '',
    component: PerfilConsultorPage
  },
  {
    path: ':id_lead',
    component: PerfilConsultorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PerfilConsultorPageRoutingModule {}
