import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BoletoDoacaoPageRoutingModule } from './boleto-doacao-routing.module';

import { BoletoDoacaoPage } from './boleto-doacao.page';
import { GlobalComponentsModule } from 'src/app/component-page/global-components.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BoletoDoacaoPageRoutingModule,
    GlobalComponentsModule
  ],
  declarations: [BoletoDoacaoPage]
})
export class BoletoDoacaoPageModule {}
