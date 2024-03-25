import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PlanoCancelamentoPageRoutingModule } from './plano-cancelamento-routing.module';

import { PlanoCancelamentoPage } from './plano-cancelamento.page';
import { GlobalComponentsModule } from 'src/app/component-page/global-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PlanoCancelamentoPageRoutingModule,
    GlobalComponentsModule
  ],
  declarations: [PlanoCancelamentoPage]
})
export class PlanoCancelamentoPageModule {}
