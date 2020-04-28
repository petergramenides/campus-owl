import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { PageService } from '../_services/page.service';
import { FormBuilder } from '@angular/forms';

@Component({
	selector: 'app-pagecreate',
	templateUrl: './pagecreate.component.html',
	styleUrls: ['./pagecreate.component.scss']
})
export class PagecreateComponent implements OnInit {
	pageCreateForm;

	constructor(
		private pageService: PageService,
		private router: Router,
		private formBuilder: FormBuilder
	) { 
		this.pageCreateForm = this.formBuilder.group({
			pageName: '',
			description: '',
			date: ''
		});
	}

	ngOnInit(): void {
	}

	createPage(){
		console.log("PAGE CREATE: Submitted the following", this.pageCreateForm.value);
		this.pageService.createPage(this.pageCreateForm).subscribe(
			next => {
				alert("Page successfully created. Taking you home!");
				this.router.navigate(['/']);
			},
			error => {
				throw new Error("ERROR: Page Creation failed...");
			}
		);
	}

}
