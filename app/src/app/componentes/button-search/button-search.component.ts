import { Keyboard } from '@awesome-cordova-plugins/keyboard/ngx';
import { Component, OnInit, ViewEncapsulation, Output, EventEmitter, ViewChild, ElementRef, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
const noop = () => { };
export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
	provide: NG_VALUE_ACCESSOR,
	useExisting: forwardRef(() => ButtonSearchComponent),
	multi: true
};
@Component({
	selector: 'app-button-search',
	templateUrl: './button-search.component.html',
	styleUrls: ['./button-search.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR],
})
export class ButtonSearchComponent implements OnInit {
	public openKeyboad = false;
	@ViewChild('searchbarinput', { static: false }) searchBar: ElementRef;
	@Output() keyUp = new EventEmitter();
	@Output() closeInput = new EventEmitter();
	constructor(
		public keyboard: Keyboard,
	) { }
	ngOnInit() {
	}
	click_search() {
		this.openKeyboad = !this.openKeyboad;
		if (this.openKeyboad) {
			setTimeout(() => {
				this.searchBar && this.searchBar.nativeElement.focus();
				this.keyboard.show();
			}, 200);
		} else {
			this.value = "";
			this.closeInput.emit("");
		}
	}
	// #region ngModel
	writeValue(value: any) {
		if (value !== this.innerValue) {
			this.innerValue = value;
		}
	}
	private onTouchedCallback: () => void = noop;
	private onChangeCallback: (_: any) => void = noop;
	registerOnChange(fn: any) {
		this.onChangeCallback = fn;
	}
	registerOnTouched(fn: any) {
		this.onTouchedCallback = fn;
	}
	private innerValue: any = '';
	get value(): any {
		return this.innerValue;
	};
	set value(v: any) {
		if (v !== this.innerValue) {
			this.innerValue = v;
			this.onChangeCallback(v);
		}
	}
	// #endregion
}