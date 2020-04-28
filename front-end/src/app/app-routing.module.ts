import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { LoginComponent } from "./login/login.component";
import { RegisterComponent } from "./register/register.component";
import { HomeComponent } from "./home/home.component";
import { PostcreateComponent } from "./postcreate/postcreate.component";
import { AuthGuard } from "../app/_guards/auth.guard"
import { PagecreateComponent } from './pagecreate/pagecreate.component';
import { PageComponent } from './page/page.component';
import { IndexComponent } from "./index/index.component";

const routes: Routes = [
	{ path: "", component: IndexComponent },
	{ path: "login", component: LoginComponent },
	{ path: "register", component: RegisterComponent },

	// Routes protected by authentication
	{
		path: "",
		runGuardsAndResolvers: 'always',
		canActivate: [AuthGuard],
		children: [
			{ path: "home", component: HomeComponent },
			{ path: "createPage", component: PagecreateComponent },
			{ path: "page/:id", component: PageComponent},
			{ path: "createPost", component: PostcreateComponent }
		],
	},

	// Routes that are invalid will redirect back to the home page
	{ path: "**", redirectTo: "" },
	
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule { }
