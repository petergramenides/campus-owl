import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { LoginComponent } from "./login/login.component";
import { RegisterComponent } from "./register/register.component";
import { HomeComponent } from "./home/home.component";
import { PostcreateComponent } from "./postcreate/postcreate.component";
import { AuthGuard } from "../app/_guards/auth.guard"
import { PagecreateComponent } from './pagecreate/pagecreate.component';

const routes: Routes = [
	{ path: "login", component: LoginComponent },
	{ path: "register", component: RegisterComponent },

	// Routes protected by authentication
	{
		path: "",
		runGuardsAndResolvers: 'always',
		canActivate: [AuthGuard],
		children: [
			{ path: "", component: HomeComponent },
			{ path: "createPage", component: PagecreateComponent }
		],
	},

	// Routes that are invalid will redirect to an invalid page
	//{ path: "**", redirectTo: "" },
	
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule { }
