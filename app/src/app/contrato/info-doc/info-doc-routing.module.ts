import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InfoDocPage } from './info-doc.page';

const routes: Routes = [
  {
    path: '',
    component: InfoDocPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InfoDocPageRoutingModule {}
