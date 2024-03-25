import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TermoDeFiliacaoPageRoutingModule } from './termo-de-filiacao-routing.module';

import { TermoDeFiliacaoPage } from './termo-de-filiacao.page';
import { GlobalComponentsModule } from './../component-page/global-components.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TermoDeFiliacaoPageRoutingModule,
    GlobalComponentsModule
  ],
  declarations: [TermoDeFiliacaoPage]
})
export class TermoDeFiliacaoPageModule {}
