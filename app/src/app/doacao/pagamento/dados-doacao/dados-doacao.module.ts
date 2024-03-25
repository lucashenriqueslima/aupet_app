import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DadosDoacaoPageRoutingModule } from './dados-doacao-routing.module';

import { DadosDoacaoPage } from './dados-doacao.page';
import { GlobalComponentsModule } from 'src/app/component-page/global-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DadosDoacaoPageRoutingModule,
    GlobalComponentsModule
  ],
  declarations: [DadosDoacaoPage],
  entryComponents: []
})
export class DadosDoacaoPageModule {}
