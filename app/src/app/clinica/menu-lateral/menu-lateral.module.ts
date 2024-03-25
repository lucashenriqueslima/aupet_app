import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MenuLateralPageRoutingModule } from './menu-lateral-routing.module';

import { MenuLateralPage } from './menu-lateral.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MenuLateralPageRoutingModule
  ],
  declarations: [MenuLateralPage]
})
export class MenuLateralPageModule {}
