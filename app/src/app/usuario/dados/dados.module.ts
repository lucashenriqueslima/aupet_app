import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DadosPageRoutingModule } from './dados-routing.module';

import { DadosPage } from './dados.page';
import { GlobalComponentsModule } from 'src/app/component-page/global-components.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DadosPageRoutingModule,
    GlobalComponentsModule
  ],
  declarations: [DadosPage]
})
export class DadosPageModule {}
