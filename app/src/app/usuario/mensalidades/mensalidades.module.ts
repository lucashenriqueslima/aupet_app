import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MensalidadesPageRoutingModule } from './mensalidades-routing.module';

import { MensalidadesPage } from './mensalidades.page';
import { GlobalComponentsModule } from 'src/app/component-page/global-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MensalidadesPageRoutingModule,
    GlobalComponentsModule
  ],
  declarations: [MensalidadesPage]
})
export class MensalidadesPageModule {}
