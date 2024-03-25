import { Directive, EventEmitter, HostListener, Output } from '@angular/core';


@Directive({ selector: '[ngModel][lowercase]' })
export class LowerDirective {
	@Output() ngModelChange: EventEmitter<any> = new EventEmitter();
	@HostListener('input', ['$event']) onInputChange($event) {
		let value = $event.target.value.toLowerCase();
		this.ngModelChange.emit(value);
	}
}

@Directive({ selector: '[ngModel][uppercase]' })
export class UpperDirective {
	@Output() ngModelChange: EventEmitter<any> = new EventEmitter();
	@HostListener('input', ['$event']) onInputChange($event) {
		let value = $event.target.value.toUpperCase();
		this.ngModelChange.emit(value);
	}
}

@Directive({ selector: '[ngModel][formatnick]' })
export class FormatNickDirective {
	@Output() ngModelChange: EventEmitter<any> = new EventEmitter();
	@HostListener('input', ['$event']) onFocusout($event) {
		let value = $event.target.value.normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s]/gi, '').toLowerCase().replace(/\s/g, '');
		this.ngModelChange.emit(value);
	}
}