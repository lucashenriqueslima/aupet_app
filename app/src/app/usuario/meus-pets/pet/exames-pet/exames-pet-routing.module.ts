import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ExamesPetPage } from './exames-pet.page';

const routes: Routes = [
  {
    path: '',
    component: ExamesPetPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExamesPetPageRoutingModule {}
