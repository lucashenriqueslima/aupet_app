import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TermoDeUsoPageRoutingModule } from './termo-de-uso-routing.module';

import { TermoDeUsoPage } from './termo-de-uso.page';
import { GlobalComponentsModule } from './../component-page/global-components.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TermoDeUsoPageRoutingModule,
    GlobalComponentsModule
  ],
  declarations: [TermoDeUsoPage]
})
export class TermoDeUsoPageModule {}
