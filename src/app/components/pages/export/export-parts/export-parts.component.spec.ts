import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportPartsComponent } from './export-parts.component';

describe('ExportPartsComponent', () => {
  let component: ExportPartsComponent;
  let fixture: ComponentFixture<ExportPartsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExportPartsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportPartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
