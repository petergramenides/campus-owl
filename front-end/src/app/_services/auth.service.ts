import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, timeout } from "rxjs/operators";
import { JwtHelperService } from '@auth0/angular-jwt';
import { async } from '@angular/core/testing';


@Injectable({
	providedIn: "root",
})
export class AuthService {
	baseUrl = `http://localhost:3000`;

	constructor(private http: HttpClient, private router: Router) { }

	loggedIn(){
		const token = localStorage.getItem('token');
		return token;
	}

	login(model: any) {
		console.log("AuthService: Model is", model.value);
		return this.http.post('api/account/login', model.value).pipe(
			map((res: any) => {
				const user = res;
				if (user) {
					localStorage.setItem('token', user.success);
					localStorage.setItem('username', user.username);
				}
			})
		);
	}

	register(model : any){
		console.log("AuthService register(): Model is", model.value);
		return this.http.post('api/account/create', model.value);
	}

	logout(){
		console.log("Removing login token")
		localStorage.removeItem('token');
		this.router.navigate(['/login'])
	}
}
