import { Component, OnInit , ViewEncapsulation } from '@angular/core';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'app-dados',
  templateUrl: './dados.page.html',
  styleUrls: ['./dados.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DadosPage implements OnInit {

  constructor(
    public appService: AppService,
  ) { }

  ngOnInit() {
  }
  
  async logout() {
		this.appService.notAuth();
	}

}
