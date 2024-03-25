import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListaDoacaoPageRoutingModule } from './lista-doacao-routing.module';

import { ListaDoacaoPage } from './lista-doacao.page';

//COMPONENTES
import { GlobalComponentsModule } from '../../component-page/global-components.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListaDoacaoPageRoutingModule,
    GlobalComponentsModule
  ],
  declarations: [ListaDoacaoPage],
  entryComponents: []
})
export class ListaDoacaoPageModule { }
