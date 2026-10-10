import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndianHospitalityIndustry } from './indian-hospitality-industry';

describe('IndianHospitalityIndustry', () => {
  let component: IndianHospitalityIndustry;
  let fixture: ComponentFixture<IndianHospitalityIndustry>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IndianHospitalityIndustry],
    }).compileComponents();

    fixture = TestBed.createComponent(IndianHospitalityIndustry);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
