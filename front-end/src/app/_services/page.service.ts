import { Injectable } from '@angular/core';
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { map, timeout } from "rxjs/operators";
import { analyzeAndValidateNgModules } from '@angular/compiler';
import { NgModel } from '@angular/forms';


@Injectable({
	providedIn: 'root'
})
export class PageService {

	constructor(private http: HttpClient, private router: Router) { }

	createPage(model: any){
		model.value.session_id = localStorage.getItem('token');
		console.log("PageService: Model is", model.value);
		return this.http.post('api/pages/add', model.value).pipe(
			map((res: any) => {
				if (res) {
					console.log("RESPONSE:", res);
				}
			})
		);
	}

	getPages(){
		let session_id = localStorage.getItem('token');
		console.log("PageService: Session ID is", session_id);
		return this.http.get('api/pages');
	}

	getPosts(id : any){
		return this.http.get('api/pages/posts/'+id);
	}
}
