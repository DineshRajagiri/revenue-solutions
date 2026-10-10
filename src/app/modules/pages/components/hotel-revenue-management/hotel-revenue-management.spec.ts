import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HotelRevenueManagement } from './hotel-revenue-management';

describe('HotelRevenueManagement', () => {
  let component: HotelRevenueManagement;
  let fixture: ComponentFixture<HotelRevenueManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HotelRevenueManagement],
    }).compileComponents();

    fixture = TestBed.createComponent(HotelRevenueManagement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
