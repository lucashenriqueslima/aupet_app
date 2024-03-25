import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CriarConsultorPage } from './criar-consultor.page';

const routes: Routes = [
  {
    path: '',
    component: CriarConsultorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CriarConsultorPageRoutingModule {}
