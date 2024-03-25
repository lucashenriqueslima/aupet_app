import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CriarClinicaPage } from './criar-clinica.page';

const routes: Routes = [
  {
    path: '',
    component: CriarClinicaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CriarClinicaPageRoutingModule {}
