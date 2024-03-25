import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'app-mobile-menu',
  templateUrl: './mobile-menu.component.html',
  styleUrls: ['./mobile-menu.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MobileMenuComponent implements OnInit {

  public more_open = false;

  @Input() active_page = '1';

  constructor(
    public appService: AppService,
  ) { }

  ngOnInit() {}

  ativar_menu(){
    this.more_open = false;
  }

  open_more(){
    this.more_open = true;
  }
  close_more(){
    this.more_open = false;
  }

  navigate(page){
    this.appService.navigateUrl(`${this.appService.ambiente}/${page}`);
  }

}
