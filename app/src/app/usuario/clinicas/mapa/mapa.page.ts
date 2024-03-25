import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FiltroMapaComponent } from './../../../modal/filtro-mapa/filtro-mapa.component';
import { ClinicaMapaComponent } from './../../../modal/clinica-mapa/clinica-mapa.component';
import { AppService } from '../../../services/app.service';
import { Subject, Subscription } from 'rxjs';
import { Keyboard } from '@awesome-cordova-plugins/keyboard/ngx';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
declare var mapboxgl;
@Component({
    selector: 'app-mapa',
    templateUrl: './mapa.page.html',
    styleUrls: ['./mapa.page.scss'],
    encapsulation: ViewEncapsulation.None
})
export class MapaPage {
    map;
    @ViewChild('mapElement') mapElement;
    clinicas;
    origindata;
    subFiltroClinicas: Subscription;
    searchTermStream = new Subject<any>();
    termSearch;
    params: any = {};
    marks = [];
    especialidades = [];
    constructor(
        public keyboard: Keyboard,
        public modalController: ModalController,
        public appService: AppService,
        public router: ActivatedRoute,
    ) { }
    ngOnInit() {
        this.subFiltroClinicas = this.appService.events.filtraClinicasMap.subscribe(() => this.filter());
        this.searchTermStream.pipe(debounceTime(400)).pipe(distinctUntilChanged()).subscribe((value) => this.searchTerm(value));
        this.getClinicas();
        this.appService.httpGetOffFirst(`getEspecialidades`).subscribe(data => this.especialidades = data);
    }
    async getClinicas() {
        this.appService.httpGetOffFirst(`associado/clinicas`)
            .subscribe(data => { this.origindata = Array.from(data.clinicas); this.mapa_init(); this.filter(); }, this.appService.errorHandler);
    }
    async mapa_init() {
        mapboxgl.accessToken = 'pk.eyJ1IjoiamFsZXNjYXJkb3NvIiwiYSI6ImNrM2lyZ2FzZDBiaDgzY3J2c3B1dmtkMjcifQ.q6SdKJ6hGYlUv-DJ3BCHfw';
        this.map = new mapboxgl.Map({ container: 'map', style: 'mapbox://styles/mapbox/streets-v11', center: ['-49.355248880683455', '-16.744920807948954'], zoom: 5 });
        this.map.addControl(new mapboxgl.GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: true }));
        this.handlerMarks();
        new Promise<any>((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject))
            .then(location => this.map.flyTo({ center: [location.coords.longitude, location.coords.latitude], zoom: 11, bearing: 0, speed: 0.5, curve: 1, essential: true, }))
    }
    handlerMarks() {
        this.marks.forEach(marker => marker.remove());
        this.marks = [];
        this.clinicas?.forEach((item) => {
            if (item.latitude && item.longitude) {
                var el = document.createElement('div');
                el.className = 'marker';
                el.style.backgroundImage = 'url(assets/icon/pin.svg)';
                el.style.width = '47px';
                el.style.height = '57px';
                el.style['margin-top'] = '-25px';
                el.style.backgroundSize = '100%';
                let clickMarker = () => this.open_modal_clinica_info(item);
                el.addEventListener('click', clickMarker);
                let marker = new mapboxgl.Marker(el).setLngLat([item.longitude, item.latitude]).addTo(this.map);
                this.marks.push(marker);
            }
        });
    }
    async open_modal_clinica_info(item) {
        this.map.flyTo({ center: [item.longitude, item.latitude], zoom: 15, bearing: 0, speed: 0.5, curve: 1, essential: true, })
        const modal = await this.modalController.create({ component: ClinicaMapaComponent, componentProps: { clinica: item }, });
        return await modal.present();
    }
    searchTerm(value: string) {
        if (value?.length) {
            let fields = ['nome_fantasia'];
            if (this.appService.isEmpty(this.clinicas)) return;
            this.clinicas = this.origindata.filter(x => this.contains(fields, x, value));
        } else {
            this.clinicas = Array.from(this.origindata);
        }
        this.handlerMarks();
    }
    close_search() {
        this.termSearch = "";
        this.searchTerm('');
    }
    contains(fields, item, term) {
        let ret = false;
        fields.forEach(prop => {
            if (!this.appService.isEmpty(item[prop])) {
                let it = item[prop].toLowerCase();
                term = term.toLowerCase();
                if (it.includes(term)) return ret = true;
            }
        });
        return ret;
    }
    async open_modal_filtrar() {
        const modal = await this.modalController.create({ component: FiltroMapaComponent, componentProps: { params: this.params, especialidades: this.especialidades } });
        return await modal.present();
    }
    ngOnDestroy() {
        this.subFiltroClinicas?.unsubscribe();
    }
    filter() {
        this.clinicas = Array.from(this.origindata);
        if (this.termSearch && this.termSearch != '') return this.searchTerm(this.termSearch);
        if (!location.href.split('?')[1]) {
            this.handlerMarks();
            return;
        }
        let filtros = [];
        let params = new URLSearchParams(location.href.split('?')[1]);
        let especialidade = params.get('especialidade');
        if (especialidade) filtros.push(especialidade.split(',').map(y => `x.especialidades.some(g => g.id == '${y}')`).reduce((a, b) => `${a} || ${b}`));
        let query = 'x => ' + filtros.reduce((a, b) => `(${a}) && (${b})`);
        this.clinicas = this.clinicas.filter(eval(query));
        this.handlerMarks();
        // this.ordenar(this.ordem);
    }
    back() {
        window.history.back();
    }
}
