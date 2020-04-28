import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../_services/auth.service';

@Injectable({
	providedIn: 'root'
})
export class AuthGuard implements CanActivate {
	constructor(
		private authService: AuthService,
		private router: Router
	) { }

	canActivate(): boolean {
		if (!this.authService.loggedIn()) {
			alert('Please Log In to Proceed');
			this.router.navigate(['/login']);
			return false;
		}
		else{
			return true;
		}

	}

}
