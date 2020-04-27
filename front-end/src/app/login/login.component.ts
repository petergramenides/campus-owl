import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { FormBuilder } from "@angular/forms";
import { AuthService } from "../_services/auth.service";

@Component({
	selector: "app-login",
	templateUrl: "./login.component.html",
	styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit {
	loginForm: any;

	constructor(
		private router: Router,
		private formBuilder: FormBuilder,
		private authService: AuthService
	) {
		this.loginForm = this.formBuilder.group({
			username: "",
			password: "",
		});
	}

	ngOnInit(): void { }

	login() {
		console.log("LOGIN: Submitted the following...", this.loginForm.value);
		this.authService.login(this.loginForm).subscribe(
			(next) => {
				this.router.navigate(["/home"]);
			},
			(error) => {
				console.error("ERROR: Login failed...");
			}
		);
	}
}
