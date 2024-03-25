import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InfoPetPage } from './info-pet.page';

const routes: Routes = [
  {
    path: '',
    component: InfoPetPage
  },
  {
    path: 'vacinas-pet',
    loadChildren: () => import('../../../../usuario/meus-pets/pet/vacinas-pet/vacinas-pet.module').then( m => m.VacinasPetPageModule)
  },
  {
    path: 'exames-pet',
    loadChildren: () => import('../../../../usuario/meus-pets/pet/exames-pet/exames-pet.module').then( m => m.ExamesPetPageModule)
  },
  {
    path: 'medicamentos-pet',
    loadChildren: () => import('../../../../usuario/meus-pets/pet/medicamentos-pet/medicamentos-pet.module').then( m => m.MedicamentosPetPageModule)
  },
  {
    path: 'vermifugos-pet',
    loadChildren: () => import('../../../../usuario/meus-pets/pet/vermifugos-pet/vermifugos-pet.module').then( m => m.VermifugosPetPageModule)
  },
  {
    path: 'banhos-pet',
    loadChildren: () => import('../../../../usuario/meus-pets/pet/banhos-pet/banhos-pet.module').then( m => m.BanhosPetPageModule)
  },
  {
    path: 'carteirinha-pet',
    loadChildren: () => import('../../../../usuario/meus-pets/pet/carteirinha-pet/carteirinha-pet.module').then( m => m.CarteirinhaPetPageModule)
  },
  {
    path: 'plano/:id',
    loadChildren: () => import('../../../../usuario/planos/planos.module').then( m => m.PlanosPageModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InfoPetPageRoutingModule {}
