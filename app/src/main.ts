import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
if (environment.production) {
	enableProdMode();
}
platformBrowserDynamic().bootstrapModule(AppModule)
	.catch(err => console.log(err));
declare global {
	interface Storage {
		setObject: (key: string, value: object) => any;
		getObject: (key: string) => any;
	}
}
if (!Storage.prototype.setObject) {
	Storage.prototype.setObject = function (key, value) {
		try {
			this.setItem(key, JSON.stringify(value));
		} catch (e) {
			this.setItem(key, value);
		}
	}
}
if (!Storage.prototype.getObject) {
	Storage.prototype.getObject = function (key) {
		var value = this.getItem(key);
		try {
			return JSON.parse(value);
		} catch (e) {
			return value;
		}
	}
}
if (!('multidelete' in Object.prototype)) {
	Object.defineProperty(Object.prototype, 'multidelete', {
		value: function () {
			for (var i = 0; i < arguments.length; i++) {
				delete this[arguments[i]];
			}
		}
	});
}