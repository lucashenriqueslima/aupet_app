import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'clinica-menu-lateral',
  templateUrl: './menu-lateral.page.html',
  styleUrls: ['./menu-lateral.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MenuLateralPage implements OnInit {

  constructor(
    public appService: AppService,
    public menu: MenuController,
    ) { }

  ngOnInit() {
    // this.foto = this.appService.user?.foto;
  }

}
