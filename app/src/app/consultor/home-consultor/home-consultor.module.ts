import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HomeConsultorPageRoutingModule } from './home-consultor-routing.module';
import { HomeConsultorPage } from './home-consultor.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomeConsultorPageRoutingModule,
  ],
  declarations: [HomeConsultorPage]
})
export class HomeConsultorPageModule {}
