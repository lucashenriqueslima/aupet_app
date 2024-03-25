import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef, HostListener } from '@angular/core';
import { AppService } from 'src/app/services/app.service';
import { ActivatedRoute } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import * as SigPad from 'signature_pad';
@Component({
	selector: 'obter-assinatura',
	templateUrl: './obter-assinatura.page.html',
	styleUrls: ['./obter-assinatura.page.scss'],
	encapsulation: ViewEncapsulation.None
})
export class ObterAssinaturaPage {
	constructor(
		public appService: AppService,
		public route: ActivatedRoute,
		public loadingCtrl: LoadingController,
	) { }
	@ViewChild('canvas', { static: false }) canvas: ElementRef;
	signaturePad;
	loading;
	ngAfterViewInit() {
		var width = window.innerWidth;
		var height = window.innerHeight - 112;
		this.canvas.nativeElement.height = height;
		this.canvas.nativeElement.width = width;
		this.signaturePad = new SigPad.default(this.canvas.nativeElement);
	}
	async ngOnInit() {
		this.loading = await this.loadingCtrl.create({ message: 'Enviando assinatura ...' });
	}
	btnLimpar() {
		this.signaturePad.clear();
	}
	@HostListener('window:resize', ['$event'])
	onResize(e) {
		location.reload();
	}
	async salvar() {
		try {
			await this.loading.present();
			let file = await new Promise<Blob>(resolve => { this.canvas.nativeElement.toBlob(resolve, 'image/png', 1); });
			let img = document.createElement("img");
			img.src = await new Promise<any>(resolve => { let reader = new FileReader(); reader.onload = (e: any) => resolve(e.target.result); reader.readAsDataURL(file); });
			await new Promise(resolve => img.onload = resolve)
			let canvas = document.createElement("canvas");
			let ctx = canvas.getContext("2d");
			ctx.drawImage(img, 0, 0);
			let MAX_WIDTH = 400;
			let MAX_HEIGHT = 400;
			let width = img.width;
			let height = img.height;
			if (width > height) { if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; } } else { if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; } }
			canvas.width = width;
			canvas.height = height;
			ctx = canvas.getContext("2d");
			ctx.drawImage(img, 0, 0, width, height);
			let novo = await new Promise<Blob>(resolve => { canvas.toBlob(resolve, 'image/png', 1); });
			let fd = new FormData();
			fd.append("assinatura", novo);
			await this.appService.httpPost(`proposta/setassinatura/${this.route.snapshot.params.id_pet}`, fd, null, 60000);
			this.appService.events.contratoUpdate.emit();
			this.appService.events.upDetailLead.emit();
			this.appService.showToast("Assinatura enviada com sucesso");
			window.history.back();
		} catch (e) {
			this.appService.errorHandler(e);
		} finally {
			this.loading.dismiss();
		}
	}
}