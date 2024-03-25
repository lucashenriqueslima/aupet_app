import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListaPetPage } from './lista-pet.page';

const routes: Routes = [
  {
    path: '',
    component: ListaPetPage
  },
  {
    path: 'adicionar-pet',
    loadChildren: () => import('../../../usuario/meus-pets/adicionar-pet/adicionar-pet.module').then( m => m.AdicionarPetPageModule)
  },
  {
    path: 'adicionar-pet/:id_plano',
    loadChildren: () => import('../../../usuario/meus-pets/adicionar-pet/adicionar-pet.module').then( m => m.AdicionarPetPageModule)
  },
  {
    path: 'pet/:id',
    loadChildren: () => import('../../../usuario/meus-pets/pet/info-pet/info-pet.module').then( m => m.InfoPetPageModule)
  },
  {
    path: 'editar-pet/:id',
    loadChildren: () => import('../../../usuario/meus-pets/adicionar-pet/adicionar-pet.module').then( m => m.AdicionarPetPageModule)
  },
  {
    path: 'dados-pet/:id_pet',
    loadChildren: () => import('../../../lead/dados-plano-pet/dados-plano-pet.module').then(m => m.DadosPlanoPetPageModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListaPetPageRoutingModule {}
