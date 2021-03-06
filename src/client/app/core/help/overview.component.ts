import { Component, Output, EventEmitter } from '@angular/core';

@Component({
	templateUrl: './overview.component.html'
})
export class OverviewHelpComponent {
	@Output() backEvent = new EventEmitter();

	protected back() {
		this.backEvent.emit({});
	}

}
