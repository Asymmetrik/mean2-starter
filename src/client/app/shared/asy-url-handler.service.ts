import { Injectable } from '@angular/core';

import { IUrlHandler } from './iurlhandler.class';

@Injectable()
export class AsyUrlHandler implements IUrlHandler {
	constructor() { }

	public handleUrl(url: string) {
		window.location.href = url;
	}
}