import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FinalizadoDoacaoPageRoutingModule } from './finalizado-doacao-routing.module';

import { FinalizadoDoacaoPage } from './finalizado-doacao.page';
import { GlobalComponentsModule } from './../../../component-page/global-components.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FinalizadoDoacaoPageRoutingModule,
    GlobalComponentsModule
  ],
  declarations: [FinalizadoDoacaoPage],
})
export class FinalizadoDoacaoPageModule {}
