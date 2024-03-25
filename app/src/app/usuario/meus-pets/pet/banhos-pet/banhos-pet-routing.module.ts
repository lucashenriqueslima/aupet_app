import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BanhosPetPage } from './banhos-pet.page';

const routes: Routes = [
  {
    path: '',
    component: BanhosPetPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BanhosPetPageRoutingModule {}
