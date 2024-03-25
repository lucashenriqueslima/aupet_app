import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser'
@Pipe({ name: 'reverse' })
export class ReversePipe {
	transform(value) {
		return value.slice().reverse();
	}
}
@Pipe({ name: "sort" })
export class ArraySortPipe {
	transform(array: any[], field: string): any[] {
		array.sort((a: any, b: any) => {
			if (a[field] < b[field]) {
				return -1;
			} else if (a[field] > b[field]) {
				return 1;
			} else {
				return 0;
			}
		});
		return array;
	}
}
@Pipe({ name: 'safeLink' })
export class SafeLinkPipe implements PipeTransform {
	constructor(private sanitized: DomSanitizer) { }
	transform(value) {
		var text = value;
		var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
		var text1 = text.replace(exp, "<a target='_blank' style='color:blue' href='$1'>$1</a>");
		var exp2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
		let ret = text1.replace(exp2, "$1<a target='_blank' style='color:blue' href='http://$2'>$2</a>");
		return this.sanitized.bypassSecurityTrustHtml(ret);
	}
}
@Pipe({ name: 'safeHtml' })
export class SafeHtmlPipe implements PipeTransform {
	constructor(private sanitized: DomSanitizer) { }
	transform(value) {
		return this.sanitized.bypassSecurityTrustHtml(value);
	}
}
@Pipe({ name: 'notfNotRead', pure: false })
export class notfNotReadPipe implements PipeTransform {
	constructor(private sanitized: DomSanitizer) { }
	transform(value) {
		if (!value) return 0;
		return value.filter(x => !x.lida).length;
	}
}
@Pipe({ name: 'callback', pure: false })
export class CallbackPipe implements PipeTransform {
    transform(items: any[], callback: (item: any) => boolean): any {
        if (!items || !callback) {
            return items;
        }
        return items.filter(item => callback(item));
    }
}