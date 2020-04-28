import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { AuthService } from '../_services/auth.service';
import { FormBuilder } from '@angular/forms';

@Component({
	selector: 'app-register',
	templateUrl: './register.component.html',
	styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
	registerForm;

	constructor(
		private authService: AuthService,
		private router: Router,
		private formBuilder: FormBuilder
	) { 
		this.registerForm = this.formBuilder.group({
			first_name: '',
			last_name: '',
			username: '',
			email: '',
			password: '',
			dob: ''
		});
	}

	ngOnInit(): void {
	}

	register(){
		console.log("REGISTER: Submitted the following...", this.registerForm.value);
		this.authService.register(this.registerForm).subscribe(
			next =>{
				this.router.navigate(['/login']);
			},
			error =>{
				throw new Error("ERROR: Register failed.");
			}
		);
	}

}
