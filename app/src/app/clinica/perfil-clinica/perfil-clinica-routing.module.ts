import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PerfilClinicaPage } from './perfil-clinica.page';

const routes: Routes = [
  {
    path: '',
    component: PerfilClinicaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PerfilClinicaPageRoutingModule {}
