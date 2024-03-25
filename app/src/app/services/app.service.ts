import { async } from '@angular/core/testing';
import { Injectable, EventEmitter, ErrorHandler } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { AlertController, ToastController, Platform, LoadingController, ActionSheetController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as Sentry from '@sentry/browser';
import { timeout } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import * as copy from 'copy-to-clipboard';
import { Camera, CameraOptions } from '@awesome-cordova-plugins/camera/ngx';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import { Keyboard } from '@awesome-cordova-plugins/keyboard/ngx';
@Injectable({ providedIn: 'root' })
export class Events {
	public upDetailLead = new EventEmitter();
	public filtraListaLeads = new EventEmitter();
	public contratoUpdate = new EventEmitter();
	public filtraClinicasMap = new EventEmitter();
	public upAssciadoPetDetalhes = new EventEmitter();
	public upAssocListExame = new EventEmitter();
	public upAssocListMedicamentos = new EventEmitter();
	public upAssocVermList = new EventEmitter();
	public upAssocBanhoList = new EventEmitter();
	public upAssocVacinaList = new EventEmitter();
	
}
@Injectable({ providedIn: 'root' })
export class AppService implements ErrorHandler {
	constructor(
		public keyboard: Keyboard,
		public events: Events,
		public _sanitizer: DomSanitizer,
		public router: Router,
		public loadingCtrl: LoadingController,
		public toastCtrl: ToastController,
		public alertCtrl: AlertController,
		public storage: Storage,
		public http: HttpClient,
		public platform: Platform,
		public camera: Camera,
		public socialSharing: SocialSharing,
		public actionSheetCrtl: ActionSheetController,
	) {
		this.initializeService();
	}
	public enviroment = environment;
	public notifications;
	private defaultTimeout = 15000;
	public async navigateUrl(url) {
		await this.router.navigateByUrl(url);
	}
	public async navigateRelative(url, activatedRoute) {
		await this.router.navigate([url], { relativeTo: activatedRoute });
	}
	public httpPostOffFirst(endPoint, data = {}, empresa?, _timeout = this.defaultTimeout): Observable<any> {
		return Observable.create(async (observer: Observer<any>) => {
			try {
				let offline = await this.storage.get(this.getKeyStorage(endPoint, data));
				if (offline) observer.next(offline);
				let result = await this.http.post(environment.urlApi + endPoint, data).pipe(timeout(_timeout)).toPromise();
				observer.next(result);
				if (result) await this.storage.set(this.getKeyStorage(endPoint, data), result);
			} catch (e) {
				observer.error(this.errorHandler(e));
			} finally {
				observer.complete();
			}
		});
	}
	public httpGetOffFirst(endPoint, empresa?, _timeout = this.defaultTimeout): Observable<any> {
		return Observable.create(async (observer: Observer<any>) => {
			try {
				let offline = await this.storage.get(this.getKeyStorage(endPoint));
				if (offline) observer.next(offline);
				let result = await this.http.get(environment.urlApi + endPoint).pipe(timeout(_timeout)).toPromise();
				observer.next(result);
				if (result) await this.storage.set(this.getKeyStorage(endPoint), result);
			} catch (e) {
				observer.error(this.errorHandler(e));
			} finally {
				observer.complete();
			}
		});
	}
	public httpPost(endPoint, data = {}, empresa?, _timeout = this.defaultTimeout) {
		return new Promise<any>(async (resolve, reject) => {
			try {
				let response = await this.http.post(environment.urlApi + endPoint, data).pipe(timeout(_timeout)).toPromise();
				resolve(response);
			} catch (e) {
				reject(this.errorHandler(e));
			}
		});
	}
	public httpPut(endPoint, data = {}, empresa?, _timeout = this.defaultTimeout) {
		return new Promise<any>(async (resolve, reject) => {
			try {
				let response = await this.http.put(environment.urlApi + endPoint, data).pipe(timeout(_timeout)).toPromise();
				resolve(response);
			} catch (e) {
				reject(this.errorHandler(e));
			}
		});
	}
	public httpGet(url, empresa?, _timeout = this.defaultTimeout) {
		return new Promise<any>(async (resolve, reject) => {
			try {
				let response = await this.http.get(`${environment.urlApi}${url}`).pipe(timeout(_timeout)).toPromise();
				resolve(response);
			} catch (e) {
				reject(this.errorHandler(e));
			}
		});
	}
	private async _headers(empresa?) {
		// let headers: any = {};
		// headers.version_app = environment.version;
		// if (empresa) headers.access_company = empresa;
		// else if(!empresa) headers.access_company = 'aupet';
		// return { 'headers': new HttpHeaders(headers) } as any;
	}
	public isEmpty(obj) {
		if (typeof obj == 'number') return false;
		else if (typeof obj == 'string') return obj.length == 0;
		else if (Array.isArray(obj)) return obj.length == 0;
		else if (typeof obj == 'object') return obj == null || Object.keys(obj).length == 0;
		else if (typeof obj == 'boolean') return false;
		else return !obj;
	}
	public errorHandler(e) {
		if (e.status == 401) this.notAuth();
		else if (e.status == 400) this.showAlert(null, e.error);
		else if (e.status == 500 || e.status == 404) this.showToast('Ocorreu um erro inesperado. Tente novamente mais tarde.', 2000);
		else if (e.status == 555) this.versaoDesatualizada();
		else if (typeof e == 'string' && e != 'cancel') this.showAlert(null, e);
		// else if (e.name == "TimeoutError") this.showToast();
		else if (environment.production && e != 'cancel') this.handleError(e);
		else if (!environment.production) console.error(e);
		return e;
	}
	public async versaoDesatualizada() {
		let alrt = await this.alertCtrl.create({
			header: 'Versão desatualizada',
			subHeader: 'Atualizar seus aplicativos é essencial por questão de segurança. Por favor, atualize seu aplicativo para continuar.',
			buttons: [{ text: 'Atualizar', handler: () => { if (this.platform.is('cordova')) window.open(environment.urlPlayStore); else this.reloadPwa(); } }, 'Ok']
		});
		await alrt.present();
	}

	handleError(e) {
		if (!environment.production || !e) return;
		Sentry.configureScope(scope => {
			scope.setTag('cliente', localStorage.getItem('empresa'));
		});
		Sentry.captureException(e);
	}
	public async notAuth() {
		window.stop();
		await this.storage.clear();
		localStorage.clear();
		this.user = {};
		this.navigateUrl('/login');
	}
	public showAlert(title = null, msg: string) {
		return new Promise<void>(async resolve => {
			let alrt = await this.alertCtrl.create({
				header: title || 'Atenção',
				subHeader: msg,
				buttons: [{ text: 'OK', handler: resolve }],
				cssClass: 'alertWarning'
			});
			await alrt.present();
		});
	}

	public async showConfirm(title = null, mgs: string, data: any){
		return new Promise<void>(async resolve => {
			let alrt = await this.alertCtrl.create({
				header: mgs || 'Confirmação !',
				subHeader: 'Deseja reativar usuário?',
				buttons: [
					{
						text: 'Não',
						role: 'cancel',
						handler: () => {
						//   console.log('Cancel clicked');
						}
					},
					{
						text: 'Sim',
						handler: async () => {
							let active = await this.httpPost(`reativarUsuario`,data);
							this.showSuccess(null,'Usuário reativado! Realize login novamente.');
						}
					}
				]
			});
			await alrt.present();
		});
	}

	public showSuccess(title = null, msg: string) {
		return new Promise<void>(async resolve => {
			let alrt = await this.alertCtrl.create({
				header: title || 'Sucesso !',
				subHeader: msg,
				buttons: [{ text: 'OK', handler: resolve }],
				cssClass: 'alertSuccess'
			});
			await alrt.present();
		});
	}
	public async showToast(msg = null, duration = 1500) {
		const toast = await this.toastCtrl.create({
			message: msg || 'Ops, houve um problema com uma requisição.',
			duration: duration,
			position: 'bottom'
		});
		await toast.present();
	}
	public async sharedMsg(msg) {
		try {
			if (!environment.production) console.log(msg);
			if (this.platform.is('cordova')) {
				await this.socialSharing.share(msg);
			} else if ((navigator as any).share) {
				(navigator as any).share({ text: msg }).catch((error) => { copy(msg); alert('Mensagem copiada para área de transferência'); });
			} else {
				copy(msg);
				alert('Mensagem copiada para área de transferência');
			}
		} catch (e) {
			copy(msg);
			alert('Mensagem copiada para área de transferência');
		}
	}
	//#region persistent
	public get ambiente(): any {
		return localStorage.getObject('ambiente');
	}
	public set ambiente(v: any) {
		localStorage.setObject('ambiente', v);
	}
	public get user(): any {
		return localStorage.getObject('user');
	}
	public set user(v: any) {
		localStorage.setObject('user', v);
	}
	public getKeyStorage(url, data = null) {
		return `aupet${url}${data ? JSON.stringify(data) : ''}`;
	}

	public set dataDoacao(v: any){
		localStorage.setObject('dataDoacao', v);
	} 

	public get dataDoacao(): any {
		return localStorage.getObject('dataDoacao');
	} 

	public set resDoacao(v: any){
		localStorage.setObject('resDoacao', v);
	} 
	
	public get resDoacao(): any {
		return localStorage.getObject('resDoacao');
	} 

	//#endregion persistent
	async getImageBase() {
		if (this.platform.is('cordova')) {
			let PictureSourceType = await this.selectMidia();
			const options: CameraOptions = {
				targetWidth: 1300,
				targetHeight: 1300,
				quality: 80,
				destinationType: this.camera.DestinationType.DATA_URL,
				encodingType: this.camera.EncodingType.JPEG,
				mediaType: this.camera.MediaType.PICTURE,
				correctOrientation: true,
				sourceType: PictureSourceType
			};
			return 'data:image/jpeg;base64,' + (await this.camera.getPicture(options));
		} else {
			let input: any = window.document.getElementById('generic-input');
			input.setAttribute('type', "file");
			input.setAttribute('accept', "image/*");
			let PictureSourceType = await this.selectMidia();
			if (PictureSourceType == this.camera.PictureSourceType.CAMERA) input.setAttribute('capture', "camera");
			else input.removeAttribute('capture');
			input.click();
			await new Promise<any>(resolve => input.addEventListener('change', evt => resolve(evt)));
			return await this.resizeImgJS(input.files[0]);
		}
	}
	selectMidia(lib = true) {
		return new Promise<any>(async (resolve, reject) => {
			let buttons = [];
			buttons.push({ text: 'Camera', handler: () => resolve(this.camera.PictureSourceType.CAMERA) });
			if (lib)
				buttons.push({ text: 'Biblioteca', handler: () => resolve(this.camera.PictureSourceType.PHOTOLIBRARY) });
			buttons.push({ text: 'Cancelar', role: 'cancel', handler: () => reject('cancel') });
			let actionSheet = await this.actionSheetCrtl.create({
				header: 'Selecione',
				buttons: buttons
			});
			await actionSheet.present();
			actionSheet.onDidDismiss().then(() => reject('cancel'));
		});
	}
	async resizeImgJS(file: Blob): Promise<string> {
		let img = document.createElement("img");
		img.src = await new Promise<any>(resolve => { let reader = new FileReader(); reader.onload = (e: any) => resolve(e.target.result); reader.readAsDataURL(file); });
		await new Promise(resolve => img.onload = resolve)
		let canvas = document.createElement("canvas");
		let ctx = canvas.getContext("2d");
		ctx.drawImage(img, 0, 0);
		let MAX_WIDTH = 1300;
		let MAX_HEIGHT = 1300;
		let width = img.width;
		let height = img.height;
		if (width > height) { if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; } } else { if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; } }
		canvas.width = width;
		canvas.height = height;
		ctx = canvas.getContext("2d");
		ctx.drawImage(img, 0, 0, width, height);
		// let result = await new Promise<Blob>(resolve => { canvas.toBlob(resolve, 'image/jpeg', 0.95); });
		let result = canvas.toDataURL("image/jpeg");
		return result;
	}
	sanitazeUrlImg(url: string) {
		return this._sanitizer.bypassSecurityTrustStyle(url);
	}
	sanitazeStyleImg(url: string) {
		return this._sanitizer.bypassSecurityTrustUrl(url);
	}
	sanitazeResourceImg(url: string) {
		return this._sanitizer.bypassSecurityTrustResourceUrl(url);
	}
	public formatObj(bodyObj_: Object, fieldsToChange: Array<string>, updateObject = {}): any {
		let bodyObj = Object.assign({}, bodyObj_);
		fieldsToChange.forEach(p => { if (!this.isEmpty(bodyObj[p]) && typeof bodyObj[p] != 'object') updateObject[p] = bodyObj[p]; });
		return updateObject;
	}
	public dateToYMD(d) {
		return d.getFullYear() + "-" + ("00" + (d.getMonth() + 1)).slice(-2) + "-" + ("00" + d.getDate()).slice(-2) + " " + ("00" + d.getHours()).slice(-2) + ":" + ("00" + d.getMinutes()).slice(-2) + ":" + ("00" + d.getSeconds()).slice(-2);
	}
	public async getFilePhone(): Promise<{ blob: Blob, name: string }> {
		const headers = new HttpHeaders({ 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET' });
		let input = window.document.createElement('input');
		input.setAttribute('type', "file");
		input.click();
		await new Promise<any>(resolve => input.addEventListener('change', evt => resolve(evt)));
		let blob = await this.http.get(window.URL.createObjectURL(input.files[0]), { headers, responseType: 'blob' }).toPromise();
		let name = input.files[0].name;
		return { "blob": blob, "name": name };
	}
	public loading: HTMLIonLoadingElement;
	public async loadingShow(msg?: string) {
		this.loading = await this.loadingCtrl.create({ message: msg || 'Processando...' });
		await this.loading.present();
	}
	getPathFileName(imagePath) {
		imagePath = imagePath.split('?')[0];
		return {
			Name: imagePath.substr(imagePath.lastIndexOf('/') + 1),
			Path: imagePath.substr(0, imagePath.lastIndexOf('/') + 1)
		}
	}
	initializeService() {
		if (!this.platform.is('cordova')) this.defaultTimeout = 30000;
	}
	reloadPwa() {
		if (this.platform.is('cordova')) return
		setTimeout(() => document.location.reload(), 1000);
		if (caches) caches.keys().then(keys => keys.forEach(key => caches.delete(key)));
	}
	maskToDate(dateStr) {
		if (!dateStr) return;
		var parts = dateStr.split("/");
		return new Date(parts[2], parts[1] - 1, parts[0]);
	}

	public async delDadosDoacoes(){
		await this.storage.remove('dataDoacao');
		await this.storage.remove('resDoacao');
		localStorage.removeItem('dataDoacao');
		localStorage.removeItem('resDoacao');
		this.resDoacao = {};
		this.dataDoacao = {};
		this.navigateUrl(`${this.ambiente}`);
	}

	public validaCPF(strCPF) {
		var Soma;
		var Resto;
		Soma = 0;

		strCPF = strCPF.replace(/[^0-9]/g,"");
	  if (strCPF == "00000000000") return false;
	
	  for (let i=1; i<=9; i++) Soma = Soma + parseInt(strCPF.substring(i-1, i)) * (11 - i);
	  Resto = (Soma * 10) % 11;
	
		if ((Resto == 10) || (Resto == 11))  Resto = 0;
		if (Resto != parseInt(strCPF.substring(9, 10)) ) return false;
	
	  Soma = 0;
		for (let i = 1; i <= 10; i++) Soma = Soma + parseInt(strCPF.substring(i-1, i)) * (12 - i);
		Resto = (Soma * 10) % 11;
	
		if ((Resto == 10) || (Resto == 11))  Resto = 0;
		if (Resto != parseInt(strCPF.substring(10, 11) ) ) return false;
		return true;
	}

	public validaCNPJ(cnpj){
		cnpj = cnpj.replace(/[^\d]+/g,'');
 
		if(cnpj == '') return false;
		 
		if (cnpj.length != 14)
			return false;
	 
		// Elimina CNPJs invalidos conhecidos
		if (cnpj == "00000000000000" || 
			cnpj == "11111111111111" || 
			cnpj == "22222222222222" || 
			cnpj == "33333333333333" || 
			cnpj == "44444444444444" || 
			cnpj == "55555555555555" || 
			cnpj == "66666666666666" || 
			cnpj == "77777777777777" || 
			cnpj == "88888888888888" || 
			cnpj == "99999999999999")
			return false;
			 
		// Valida DVs
		let tamanho = cnpj.length - 2
		let numeros = cnpj.substring(0,tamanho);
		let digitos = cnpj.substring(tamanho);
		let soma = 0;
		let pos = tamanho - 7;
		for (let i = tamanho; i >= 1; i--) {
		  soma += numeros.charAt(tamanho - i) * pos--;
		  if (pos < 2)
				pos = 9;
		}
		let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
		if (resultado != digitos.charAt(0))
			return false;
			 
		tamanho = tamanho + 1;
		numeros = cnpj.substring(0,tamanho);
		soma = 0;
		pos = tamanho - 7;
		for (let i = tamanho; i >= 1; i--) {
		  soma += numeros.charAt(tamanho - i) * pos--;
		  if (pos < 2)
				pos = 9;
		}
		resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
		if (resultado != digitos.charAt(1))
			  return false;
			   
		return true;
	}
	

}