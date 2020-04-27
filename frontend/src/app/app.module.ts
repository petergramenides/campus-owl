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


@NgModule({
	declarations: [
		AppComponent,
		HeaderComponent,
		ForumComponent,
		PostComponent,
		UserComponent
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		BrowserAnimationsModule,
		MaterialModule,
		FormsModule,
		ReactiveFormsModule
	],
	providers: [],
	bootstrap: [AppComponent],
})
export class AppModule { }
