// import { Injectable, } from '@angular/core';
// import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
// import { Observable } from 'rxjs';

// import { Article, ArticlesService, UserService } from '../core';
// import { catchError } from 'rxjs/operators';

// @Injectable()
// export class PostResolver implements Resolve<Post> {
//   constructor(
//     private articlesService: ArticlesService,
//     private router: Router,
//     private userService: UserService
//   ) {}

//   resolve(
//     route: ActivatedRouteSnapshot,
//     state: RouterStateSnapshot
//   ): Observable<any> {

//     return this.postService.get(route.params['slug'])
//       .pipe(catchError((err) => this.router.navigateByUrl('/')));
//   }
// }