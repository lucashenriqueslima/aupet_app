import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListaLeadPage } from './lista-lead.page';

const routes: Routes = [
  {
    path: '',
    component: ListaLeadPage
  },
  {
    path: 'interno/:id',
    loadChildren: () => import('../../lead/interno-lead/interno-lead.module').then( m => m.InternoLeadPageModule)
  },
  // {
  //   path: 'dados-pet/:id',
  //   loadChildren: () => import('../../lead/dados-plano-pet/dados-plano-pet.module').then( m => m.DadosPlanoPetPageModule)
  // },
  {
    path: 'dados-pet/:id_pet',
    loadChildren: () => import('../../usuario/meus-pets/pet/editar-dados-pet/editar-dados-pet.module').then( m => m.EditarDadosPetPageModule)
  },
  {
    path: 'status',
    loadChildren: () => import('../../lead/status-lead/status-lead.module').then( m => m.StatusLeadPageModule)
  },
  {
    path: 'historico',
    loadChildren: () => import('../../lead/historico-lead/historico-lead.module').then( m => m.HistoricoLeadPageModule)
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListaLeadPageRoutingModule {}
