import { Router, ActivatedRoute } from '@angular/router';
import { Component } from '@angular/core';

import { User } from '../../model/user.client.class';
import { AdminService } from '../../services/admin.client.service';
import { ManageUserComponent } from './manage-user.client.component';
import { Role } from '../../model/role.client.class';
import { ConfigService } from '../../../core/services/config.client.service';
import { AlertService } from '../../../shared/services/alert.client.service';

@Component({
	selector: 'admin-edit-user',
	templateUrl: '../../views/manage-user.client.view.html'
})
export class AdminUpdateUserComponent extends ManageUserComponent {

	private mode = 'admin-edit';

	private possibleRoles = Role.ROLES;

	private id: string;

	private sub: any;

	constructor(
		router: Router,
		configService: ConfigService,
		alertService: AlertService,
		private adminService: AdminService,
		private route: ActivatedRoute
	) {
		super(router, configService, alertService);
	}

	initialize() {
		this.sub = this.route.params.subscribe( (params: any) => {
			this.id = params.id;

			this.title = 'Edit User';
			this.subtitle = 'Make changes to the user\'s information';
			this.okButtonText = 'Save';
			this.navigateOnSuccess = '/admin/users';
			this.okDisabled = false;
			this.adminService.get(this.id).subscribe((userRaw: any) => {
				this.user = new User().setFromUserModel(userRaw);
				if (null == this.user.userModel.roles) {
					this.user.userModel.roles = {};
				}
				this.user.userModel.providerData = { dn: (null != this.user.userModel.providerData) ? this.user.userModel.providerData.dn : undefined };
				this.metadataLocked = this.proxyPki && !this.user.userModel.bypassAccessCheck;
			});
		});

	}

	ngOnDestroy() {
		this.sub.unsubscribe();
	}

	handleBypassAccessCheck() {
		// Don't need to do anything
	}

	submitUser(user: User) {
		return this.adminService.update(user);
	}

}