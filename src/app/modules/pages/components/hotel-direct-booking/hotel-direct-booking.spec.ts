import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HotelDirectBooking } from './hotel-direct-booking';

describe('HotelDirectBooking', () => {
  let component: HotelDirectBooking;
  let fixture: ComponentFixture<HotelDirectBooking>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HotelDirectBooking],
    }).compileComponents();

    fixture = TestBed.createComponent(HotelDirectBooking);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
