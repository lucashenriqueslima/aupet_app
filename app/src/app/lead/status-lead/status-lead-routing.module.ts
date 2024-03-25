import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StatusLeadPage } from './status-lead.page';

const routes: Routes = [
  {
    path: '',
    component: StatusLeadPage
  },
  {
    path: 'vistoria/:id_vistoria',
    loadChildren: () => import('src/app/vistoria/foto/foto.module').then(m => m.FotoPageModule)
  },
  {
    path: 'termo/:id_pet',
    loadChildren: () => import('src/app/contrato/contrato.module').then(m => m.ContratoPageModule)
  },
  {
    path: 'dados-adicionais',
    loadChildren: () => import('../info-adicionais/info-adicionais.module').then(m => m.InfoAdicionaisPageModule)
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StatusLeadPageRoutingModule {}