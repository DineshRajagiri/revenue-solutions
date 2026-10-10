import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HotelReputationReviews } from './hotel-reputation-reviews';

describe('HotelReputationReviews', () => {
  let component: HotelReputationReviews;
  let fixture: ComponentFixture<HotelReputationReviews>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HotelReputationReviews],
    }).compileComponents();

    fixture = TestBed.createComponent(HotelReputationReviews);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
