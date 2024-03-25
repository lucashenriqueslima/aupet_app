import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InfoDocPageRoutingModule } from './info-doc-routing.module';

import { InfoDocPage } from './info-doc.page';
import { GlobalComponentsModule } from 'src/app/component-page/global-components.module';

@NgModule({
  imports: [
    GlobalComponentsModule,
    CommonModule,
    FormsModule,
    IonicModule,
    InfoDocPageRoutingModule
  ],
  declarations: [InfoDocPage],
  entryComponents: []
})
export class InfoDocPageModule { }
