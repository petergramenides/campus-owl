import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PagecreateComponent } from './pagecreate.component';

describe('PagecreateComponent', () => {
  let component: PagecreateComponent;
  let fixture: ComponentFixture<PagecreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PagecreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PagecreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
