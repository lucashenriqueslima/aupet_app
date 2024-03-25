import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CarteirinhaPetPage } from './carteirinha-pet.page';

const routes: Routes = [
  {
    path: '',
    component: CarteirinhaPetPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CarteirinhaPetPageRoutingModule {}
