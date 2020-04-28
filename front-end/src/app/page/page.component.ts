import { Component, OnInit } from '@angular/core';
import { PageService } from '../_services/page.service';

@Component({
	selector: 'app-page',
	templateUrl: './page.component.html',
	styleUrls: ['./page.component.scss']
})
export class PageComponent implements OnInit {

	postArr: [];
	
	constructor(
		private pageService: PageService,
	) { }

	ngOnInit(): void {
		this.getPosts();
	}

	getPosts(){
		let page_id = history.state.data;
		this.pageService.getPosts(page_id).subscribe(
			next =>{
				console.log("HOME: Received response", next);

				//this.postArr = next['success'];
			},
			error =>{
				throw new Error("ERROR: Page fetching failed...")
			}
		);
	}
}
