import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ContratoPageRoutingModule } from './contrato-routing.module';
import { ContratoPage } from './contrato.page';
import { GlobalComponentsModule } from '../component-page/global-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ContratoPageRoutingModule,
    GlobalComponentsModule
  ],
  declarations: [ContratoPage],
  entryComponents: []
})
export class ContratoPageModule { }
