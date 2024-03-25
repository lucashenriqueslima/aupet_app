import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { InternoLeadPageRoutingModule } from './interno-lead-routing.module';
import { InternoLeadPage } from './interno-lead.page';
import { GlobalComponentsModule } from '../../../../src/app/component-page/global-components.module';

import { AdicionarPetComponent } from './../../modal/adicionar-pet/adicionar-pet.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InternoLeadPageRoutingModule,
    GlobalComponentsModule
  ],
  declarations: [InternoLeadPage, AdicionarPetComponent],
  entryComponents: [AdicionarPetComponent]
})
export class InternoLeadPageModule { }
