import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtaDistributionStrategy } from './ota-distribution-strategy';

describe('OtaDistributionStrategy', () => {
  let component: OtaDistributionStrategy;
  let fixture: ComponentFixture<OtaDistributionStrategy>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OtaDistributionStrategy],
    }).compileComponents();

    fixture = TestBed.createComponent(OtaDistributionStrategy);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
