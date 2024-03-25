import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CartaoDoacaoPageRoutingModule } from './cartao-doacao-routing.module';

import { CartaoDoacaoPage } from './cartao-doacao.page';
import { GlobalComponentsModule } from 'src/app/component-page/global-components.module';

//COMPONENTES

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CartaoDoacaoPageRoutingModule,
    GlobalComponentsModule
  ],
  declarations: [CartaoDoacaoPage],
  entryComponents: []
})
export class CartaoDoacaoPageModule {}
