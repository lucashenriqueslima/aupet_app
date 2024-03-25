import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { StatusLeadPageRoutingModule } from './status-lead-routing.module';
import { StatusLeadPage } from './status-lead.page';
//COMPONENTES
import { GlobalComponentsModule } from 'src/app/component-page/global-components.module';
import { CriarVistoriaPage } from 'src/app/modal/criar-vistoria/criar-vistoria.page';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StatusLeadPageRoutingModule,
    GlobalComponentsModule
  ],
  declarations: [StatusLeadPage, CriarVistoriaPage]
})
export class StatusLeadPageModule { }