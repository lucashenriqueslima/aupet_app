import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomePageRoutingModule } from './home-routing.module';
import { GlobalComponentsModule } from 'src/app/component-page/global-components.module';
import { HomePage } from './home.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    GlobalComponentsModule
  ],
  declarations: [
    HomePage
  ],
  entryComponents: [
  ]

})
export class HomePageModule {}
