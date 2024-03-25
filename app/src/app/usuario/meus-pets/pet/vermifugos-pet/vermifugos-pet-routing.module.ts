import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VermifugosPetPage } from './vermifugos-pet.page';

const routes: Routes = [
  {
    path: '',
    component: VermifugosPetPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VermifugosPetPageRoutingModule {}
