import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AlertasPageRoutingModule } from './alertas-routing.module';

import { AlertasPage } from './alertas.page';
import { GlobalComponentsModule } from 'src/app/component-page/global-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AlertasPageRoutingModule,
    GlobalComponentsModule
  ],
  declarations: [AlertasPage],
  entryComponents: []
})
export class AlertasPageModule {}
