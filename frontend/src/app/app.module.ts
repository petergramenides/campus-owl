import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { HeaderComponent } from "./components/header/header.component";
import { ForumComponent } from "./components/forum/forum.component";
import { PostComponent } from "./components/post/post.component";
import { UserComponent } from "./components/user/user.component";
import { MaterialModule } from './material.module';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { LoginComponent } from './components/login/login.component';
import { HttpClientModule } from '@angular/common/http';
import { RegisterComponent } from './components/register/register.component';


@NgModule({
	declarations: [
		AppComponent,
		HeaderComponent,
		ForumComponent,
		LoginComponent,
		RegisterComponent,
		PostComponent,
		UserComponent
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		HttpClientModule,
		BrowserAnimationsModule,
		MaterialModule,
		FormsModule,
		ReactiveFormsModule
	],
	providers: [],
	bootstrap: [AppComponent],
})
export class AppModule { }
