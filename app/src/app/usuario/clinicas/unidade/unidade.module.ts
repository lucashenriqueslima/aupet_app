import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UnidadePageRoutingModule } from './unidade-routing.module';

import { UnidadePage } from './unidade.page';

import { UnidadeAgendamentoComponent } from './../../../modal/unidade-agendamento/unidade-agendamento.component';
import { GlobalComponentsModule } from 'src/app/component-page/global-components.module';
import { NgxIonicImageViewerModule } from 'ngx-ionic-image-viewer';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UnidadePageRoutingModule,
    GlobalComponentsModule,
    NgxIonicImageViewerModule
  ],
  declarations: [UnidadePage, UnidadeAgendamentoComponent],
  entryComponents: [UnidadeAgendamentoComponent]
})
export class UnidadePageModule {}
