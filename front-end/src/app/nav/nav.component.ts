import { Component, OnInit } from '@angular/core';
import { AuthService } from "../_services/auth.service";
import { Router } from "@angular/router";

@Component({
	selector: 'app-nav',
	templateUrl: './nav.component.html',
	styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {
	navTitle: string;

	constructor(
		private router: Router,
		private authService: AuthService,
		
	){ 
		this.navTitle ="Welcome to CampusOWL";
	}

	ngOnInit(): void {
	}


	loggedIn() {
		if (this.authService.loggedIn()){
			this.navTitle="Welcome, " + localStorage.getItem('username');
		}
		return this.authService.loggedIn();
	}

	logout(){
		console.log("Logging out...");
		this.navTitle ="Welcome to CampusOWL";
		this.authService.logout();
	}
}
