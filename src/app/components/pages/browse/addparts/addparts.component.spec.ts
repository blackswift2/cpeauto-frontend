import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddpartsComponent } from './addparts.component';

describe('AddpartsComponent', () => {
  let component: AddpartsComponent;
  let fixture: ComponentFixture<AddpartsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddpartsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddpartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
