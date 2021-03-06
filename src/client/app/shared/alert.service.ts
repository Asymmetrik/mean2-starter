import { Injectable } from '@angular/core';

import 'rxjs/Rx';

import { Alert } from './alert.class';
import { Response } from '@angular/http';

class Alerts {
	list: Alert[] = [];
	map: Map<number, Alert> = new Map<number, Alert>();
}

@Injectable()
export class AlertService {
	private id: number = 0;
	private defaultType: string = 'danger';
	private alerts: Alerts = new Alerts();

	constructor() {}

	clearAllAlerts() {
		this.alerts.list.length = 0;
		this.alerts.map.clear();
	}

	clear(index: number) {
		let alert = this.alerts.list[index];
		this.alerts.list.splice(index, 1);
		this.alerts.map.delete(alert.id);
	}

	clearAlertById(id: number) {
		let alert = this.alerts.map.get(id);
		if (null != alert) {
			let index = this.alerts.list.indexOf(alert);
			this.clear(index);
		}
	}

	addAlert(msg: string, type?: string, ttl?: number) {
		type = type || this.defaultType;
		let alert = new Alert(
			this.id++,
			type || this.defaultType,
			msg);

		this.alerts.list.push(alert);
		this.alerts.map.set(alert.id, alert);

		// If they passed in a ttl parameter, age off the alert after said timeout
		if (null != ttl) {
			setTimeout(() => this.clearAlertById(alert.id), ttl);
		}
	}

	addAlertResponse(response: any) {
		if (response instanceof Response) {
			this.addAlert(response.json().message);
		}
	}

	getAlerts(): Alert[] {
		return this.alerts.list;
	}
}
