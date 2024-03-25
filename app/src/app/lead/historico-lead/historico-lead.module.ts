import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HistoricoLeadPageRoutingModule } from './historico-lead-routing.module';

import { HistoricoLeadPage } from './historico-lead.page';
import { GlobalComponentsModule } from 'src/app/component-page/global-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HistoricoLeadPageRoutingModule,
    GlobalComponentsModule
  ],
  declarations: [HistoricoLeadPage],
  entryComponents: []
})
export class HistoricoLeadPageModule {}
