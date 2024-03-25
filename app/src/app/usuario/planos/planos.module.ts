import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PlanosPageRoutingModule } from './planos-routing.module';

import { PlanosPage } from './planos.page';
import { GlobalComponentsModule } from 'src/app/component-page/global-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PlanosPageRoutingModule,
    GlobalComponentsModule
  ],
  declarations: [PlanosPage],
  entryComponents: []
})
export class PlanosPageModule {}
