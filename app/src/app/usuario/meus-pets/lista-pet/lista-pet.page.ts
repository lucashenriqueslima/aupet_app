import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { AppService } from 'src/app/services/app.service';
import { Keyboard } from '@awesome-cordova-plugins/keyboard/ngx';
@Component({
  selector: 'app-lista-pet',
  templateUrl: './lista-pet.page.html',
  styleUrls: ['./lista-pet.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ListaPetPage {

  numero_de_pets;
  pets ;

  constructor(
    public appService: AppService,
    ){ 
     }

    ngOnInit() {
      this.getPets(); 
    }

  async getPets(){
    this.appService.httpGetOffFirst(`associado/getPets`).subscribe(data =>{ this.pets = data;
    this.numero_de_pets = this.pets.length;
    },this.appService.errorHandler);
  }

  clickItem(item) {
    item.lida = 1;
      this.appService.navigateUrl(`pet/${item.id}`);
   }


}



