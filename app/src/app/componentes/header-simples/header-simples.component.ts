import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import {Location} from '@angular/common';
import { AppService } from 'src/app/services/app.service';


@Component({
  selector: 'app-header-simples',
  templateUrl: './header-simples.component.html',
  styleUrls: ['./header-simples.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HeaderSimplesComponent implements OnInit {

  @Input() title; 
  @Input() link;
  @Output() click = new EventEmitter();

  constructor(private location: Location,public appService: AppService,){}

  ngOnInit() {}

  voltar(){    
      this.location.back();
  }

  backFunction() {
		if (this.click.observers?.length) return;
    else if(this.link) this.appService.navigateUrl(this.link);
		else window.history.back();
  }

}
