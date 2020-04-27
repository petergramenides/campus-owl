import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class AuthService {

	constructor(
		private http: HttpClient,
		private router: Router
	) { }

	login(model : any){
		console.log("AuthService: Model is", model.value);
		return this.http.post('api/account/login', model.value);
	}

	register(model : any){
		console.log("AuthService register(): Model is", model.value);
		return this.http.post('api/account/create', model.value);
	}
}
