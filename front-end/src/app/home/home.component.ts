import { Component, OnInit } from '@angular/core';
import { PageService } from '../_services/page.service';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
	
	pageArr: [];
	
	constructor(
		private pageService: PageService,
	) { }

	ngOnInit(): void {
		this.getPages();
	}

	getPages(){
		console.log("HOME: Loading pages...");
		this.pageService.getPages().subscribe(
			next =>{
				console.log("HOME: Received response", next);

				this.pageArr = next['success'];
			},
			error =>{
				throw new Error("ERROR: Page fetching failed...")
			}
		)
	}
}
