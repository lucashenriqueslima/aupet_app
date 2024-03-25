import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ListaLeadPageRoutingModule } from './lista-lead-routing.module';
import { ListaLeadPage } from './lista-lead.page';
import { GlobalComponentsModule } from '../../component-page/global-components.module';
import { FiltrarLeadComponent } from './../../modal/filtrar-lead/filtrar-lead.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListaLeadPageRoutingModule,
    GlobalComponentsModule
  ],
  declarations: [ListaLeadPage, FiltrarLeadComponent],
  entryComponents: [FiltrarLeadComponent]
})
export class ListaLeadPageModule { }
