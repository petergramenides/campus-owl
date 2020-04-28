import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostcreateComponent } from './postcreate.component';

describe('PostcreateComponent', () => {
  let component: PostcreateComponent;
  let fixture: ComponentFixture<PostcreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostcreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostcreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
