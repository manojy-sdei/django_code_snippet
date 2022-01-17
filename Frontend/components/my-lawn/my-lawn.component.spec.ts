import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyLawnComponent } from './my-lawn.component';

describe('MyLawnComponent', () => {
  let component: MyLawnComponent;
  let fixture: ComponentFixture<MyLawnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyLawnComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyLawnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
