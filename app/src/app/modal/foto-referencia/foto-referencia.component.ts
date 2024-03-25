import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';


@Component({
    selector: 'app-foto-referencia',
    templateUrl: './foto-referencia.component.html',
    styleUrls: ['./foto-referencia.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class FotoReferenciaComponent implements OnInit {
    data: any;
    constructor(
        public modalCtrl: ModalController,
        public navParams: NavParams,
    ) { }

    ngOnInit() {
        this.data = this.navParams.data;
    }

    dismiss() {
        this.modalCtrl.dismiss({ 'dismissed': true });
    }
}
