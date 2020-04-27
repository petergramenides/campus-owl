import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from 'src/app/auth.service';
import { FormBuilder } from '@angular/forms';

@Component({
	selector: "app-login",
	templateUrl: "./login.component.html",
	styleUrls: ["./login.component.css"],
})
export class LoginComponent implements OnInit {
	model: any = {};
	loginForm;

	constructor(
		private authService: AuthService,
		private router: Router,
		private formBuilder: FormBuilder
	) {
		this.loginForm = this.formBuilder.group({
			email: '',
			password: ''
		});
	}

	ngOnInit(): void { }

	login() { 
		this.authService.login(this.model).subscribe(
			next => {
				this.router.navigate(['/home']);
			},
			error => {
				throw new Error("ERROR: Login failed");
			}
		);
	}
}
