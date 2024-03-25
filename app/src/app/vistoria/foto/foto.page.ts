import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ModalController, Platform } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { AppService } from 'src/app/services/app.service';
import { FotoReferenciaComponent } from './../../modal/foto-referencia/foto-referencia.component';
import { Camera, CameraOptions } from '@awesome-cordova-plugins/camera/ngx';
import { Diagnostic } from '@awesome-cordova-plugins/diagnostic/ngx';
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { InserirAnexoComponent } from 'src/app/modal/inserir-anexo/inserir-anexo.component';
import { HttpClient } from '@angular/common/http';
declare let cordova: any;
@Component({
	selector: 'app-foto',
	templateUrl: './foto.page.html',
	styleUrls: ['./foto.page.scss'],
	encapsulation: ViewEncapsulation.None
})
export class FotoPage implements OnInit {
	data: any = {};
	emAndamento = false;
	camAvaiable;
	load = false;
	constructor(
		public modalCtrl: ModalController,
		public appService: AppService,
		public route: ActivatedRoute,
		public platForm: Platform,
		public camera: Camera,
		public file: File,
		public geolocation: Geolocation,
		public diagnostic: Diagnostic,
		public http: HttpClient,
	) {
		if (navigator && navigator.mediaDevices)
			navigator.mediaDevices.enumerateDevices().then(d => this.camAvaiable = d.filter(x => x.kind == 'videoinput').length > 0);
	}
	async ngOnInit() {
		let id_vistoria = this.route.snapshot.params.id_vistoria;
		this.data = await this.appService.httpGet(`proposta/vistoria/${id_vistoria}`);
		this.data.items.forEach(async x => {
			let localItem = await this.appService.storage.get(`vistoria-item:${x.id}`);
			if (!this.appService.isEmpty(localItem)) {
				x.imagem = localItem.blob;
				x.lat = localItem.lat;
				x.lng = localItem.lng;
				x.photograp_at = localItem.photograp_at;
				x.notSync = true;
				x.aprovado = null;
			} else {
				x.notSync = false;
			}
		});
		let anexos = await this.appService.storage.get(`vistoria-anexos:${id_vistoria}`);
		if (!anexos) this.appService.storage.set(`vistoria-anexos:${id_vistoria}`, this.data.anexos);
		else this.data.anexos = anexos || [];
	}
	async open_referencia(item) {
		const modal = await this.modalCtrl.create({ component: FotoReferenciaComponent, componentProps: { item: item } });
		await modal.present();
	}
	async captureVistoria(item) {
		try {
			if (this.emAndamento) return;
			if (item.imagem && item.notSync == false && (item.aprovado == null || item.aprovado == 1)) throw 'Imagem já enviada';
			else if (this.load) throw 'Aguarde enviando imagens';
			this.emAndamento = true;
			if (this.platForm.is('cordova')) {
				if (await this.diagnostic.isLocationEnabled()) {
					let PictureSourceType = (item.lib_access == 1 || item.aprovado === 0) ? await this.appService.selectMidia() : this.camera.PictureSourceType.CAMERA;
					const options: CameraOptions = {
						targetWidth: 1300,
						targetHeight: 1300,
						quality: 80,
						destinationType: this.camera.DestinationType.FILE_URI,
						encodingType: this.camera.EncodingType.JPEG,
						mediaType: this.camera.MediaType.PICTURE,
						correctOrientation: true,
						sourceType: PictureSourceType
					};
					let currentPosition = await this.geolocation.getCurrentPosition();
					item.lat = currentPosition.coords.latitude;
					item.lng = currentPosition.coords.longitude;
					await this.insertImages((await this.camera.getPicture(options)), item);
				} else {
					await this.appService.showAlert(null, 'Por favor ative os serviços de localização para continuar.');
					this.diagnostic.switchToLocationSettings();
				}
				this.emAndamento = false;
			} else {
				if (!this.isMobilePwa() && this.appService.enviroment.production) throw 'cancel';
				let location = await new Promise<any>((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject));
				item.lat = location.coords.latitude;
				item.lng = location.coords.longitude;
				let input: any = window.document.getElementById('generic-input');
				input.setAttribute('type', "file");
				input.setAttribute('accept', "image/*");
				this.emAndamento = false; // não consigo identificar o cancel da camera -> liberando novo click
				let PictureSourceType = await this.appService.selectMidia((item.lib_access == 1 || item.aprovado === 0));
				if (PictureSourceType === this.camera.PictureSourceType.CAMERA) input.setAttribute('capture', "camera");
				else input.removeAttribute('capture');
				input.click();
				await new Promise<any>(resolve => input.addEventListener('change', evt => resolve(evt)));
				let dataURL = await this.appService.resizeImgJS(input.files[0]);
				await this.insertImagePwa(dataURL, item);
			}
		} catch (e) {
			if (e.message == "Illegal Access" || e.code == 1 || e.code == 2)
				this.appService.errorHandler("Autorize o uso da localização pelo aplicativo para continuar");
			else if (e != 'No Image Selected')
				this.appService.errorHandler(e);
			this.emAndamento = false;
		}
	}
	isMobilePwa() {
		// capturar a imagem exclusivamente pela camera
		return (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) && 'ontouchstart' in document.documentElement && (this.camAvaiable || !navigator || !navigator.mediaDevices);
	}
	async insertImagePwa(dataURL: string, item) {
		let currentDate = this.appService.dateToYMD(new Date());
		await this.appService.storage.set(`vistoria-item:${item.id}`, { 'blob': dataURL, 'lat': item.lat, 'lng': item.lng, 'photograp_at': currentDate });
		item.photograp_at = currentDate;
		item.imagem = dataURL;
		item.notSync = true;
		item.aprovado = null;
	}
	async insertImages(imagePath: string, item) {
		let currentDate = this.appService.dateToYMD(new Date());
		let current = this.getPathFileName(imagePath);
		let blob = window['Ionic']['WebView'].convertFileSrc((await this.file.copyFile(current.Path, current.Name, cordova.file.dataDirectory, new Date().getTime() + '.jpg')).nativeURL);
		if (this.platForm.is('ios')) blob = blob.replace(/^file:\/\//, '');
		this.file.removeFile(current.Path, current.Name);
		await this.appService.storage.set(`vistoria-item:${item.id}`, { 'blob': blob, 'lat': item.lat, 'lng': item.lng, 'photograp_at': currentDate });
		item.photograp_at = currentDate;
		item.imagem = blob;
		item.notSync = true;
		item.aprovado = null;
	}
	getPathFileName(imagePath) {
		imagePath = imagePath.split('?')[0];
		return {
			Name: imagePath.substr(imagePath.lastIndexOf('/') + 1),
			Path: imagePath.substr(0, imagePath.lastIndexOf('/') + 1)
		}
	}
	checkStatus(item) {
		if (!item.imagem) return '';
		else if (item.notSync == true) return 'upload';
		else if (item.aprovado == 0) return 'recusado';
		else if (item.aprovado == 1) return 'aceito';
	}
	async adicionaAnexo() {
		const modal = await this.modalCtrl.create({ component: InserirAnexoComponent });
		await modal.present();
		let data = (await modal.onDidDismiss()).data;
		if (!data) return;
		if (!this.data.anexos) this.data.anexos = [];
		this.data.anexos.push(data);
		await this.appService.storage.set(`vistoria-anexos:${this.data.vistoria.id}`, this.data.anexos);
	}
	async removeAnexo(index) {
		this.data.anexos.splice(index, 1);
	}
	async salvar() {
		try {
			if (this.load) {
				this.load = false;
				window.stop();
				this.appService.showToast('Envio cancelado. Click para tentar novamente.', 2500);
				throw 'cancel';
			}
			this.verifyAllItems(this.data.items);
			this.load = true;
			let items = this.data.items.filter(x => x.notSync == true && x.imagem && (x.aprovado == null || x.aprovado == 0));
			let i = 0;
			await new Promise<void>(async (resolve, reject) => {
				if (items.length == 0) return resolve();
				let funSync = async () => {
					try {
						let fd = new FormData();
						let blob: any = await this.http.get(items[i].imagem, { responseType: 'blob' }).toPromise();
						fd.append("imagem", blob);
						fd.append("id", items[i].id);
						fd.append("lat", items[i].lat);
						fd.append("lng", items[i].lng);
						fd.append("photograp_at", items[i].photograp_at);
						let res = await this.appService.httpPost(`proposta/vistoria/item`, fd, null, 60000);
						items[i].imagem = res.url;
						items[i].notSync = false;
						items[i].aprovado = null;
						await this.appService.storage.remove(`vistoria-item:${items[i].id}`);
						i++;
						if (i == items.length) resolve();
						else funSync();
					} catch (e) { reject(e); }
				}
				funSync();
			});
			await this.appService.httpPost(`proposta/vistoria/observacao`, { id_vistoria: this.data.vistoria.id, observacao: this.data.vistoria.observacao });
			i = 0;
			await new Promise<void>(async (resolve, reject) => {
				if (this.data.anexos.length == 0) return resolve();
				let funSync = async () => {
					try {
						if (this.data.anexos[i].anexo) {
							let fd = new FormData();
							fd.append("descricao", this.data.anexos[i].descricao);
							fd.append("id_vistoria", this.data.vistoria.id);
							fd.append("anexo", await this.http.get(window.URL.createObjectURL(this.data.anexos[i].anexo), { responseType: 'blob' }).toPromise());
							await this.appService.httpPost(`proposta/vistoria/anexo`, fd, null, 100000);
							this.data.anexos[i] = { descricao: this.data.anexos[i].descricao };
						}
						i++;
						if (i == this.data.anexos.length) resolve();
						else funSync();
					} catch (e) { reject(e); }
				}
				funSync();
			});
			this.appService.storage.remove(`vistoria-anexos:${this.data.vistoria.id}`);
			await this.appService.showAlert('Sucesso', 'Vistoria realizada com sucesso.');
			this.appService.events.upDetailLead.emit();
			window.history.back();
			this.appService.httpGetOffFirst(`proposta/vistoria/${this.route.snapshot.params.id_vistoria}`).subscribe(() => { });
		} catch (e) {
			if (typeof e != 'string' && !this.appService.isEmpty(e)) await this.appService.showAlert('Atenção', 'Desculpe, houve um problema com o envio. Para tentar novamente click em "Enviar fotos".');
			this.appService.errorHandler(e);
		} finally {
			this.load = false;
		}
	}
	verifyAllItems(items) {
		// if (!this.appService.enviroment.production) return;
		items.forEach(x => { if (x.imagem === null && x.required === 1) throw `Informe a foto (${x.descricao})`; });
	}
}