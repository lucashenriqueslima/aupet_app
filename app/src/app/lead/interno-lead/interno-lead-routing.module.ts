import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InternoLeadPage } from './interno-lead.page';


const routes: Routes = [
  {
    path: '',
    component: InternoLeadPage,
  },
  {
    path: 'pet/:id_pet',
    loadChildren: () => import('../dados-plano-pet/dados-plano-pet.module').then(m => m.DadosPlanoPetPageModule)
  },
  {
    path: 'status/:id_pet',
    loadChildren: () => import('../status-lead/status-lead.module').then(m => m.StatusLeadPageModule)
  },
  {
    path: 'dados-pet/:id_pet',
    loadChildren: () => import('../../usuario/meus-pets/pet/editar-dados-pet/editar-dados-pet.module').then( m => m.EditarDadosPetPageModule)
  },
  {
    path: 'historico',
    loadChildren: () => import('../historico-lead/historico-lead.module').then(m => m.HistoricoLeadPageModule)
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InternoLeadPageRoutingModule { }
