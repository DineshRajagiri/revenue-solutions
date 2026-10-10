import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PagesRoutingModule } from './pages-routing-module';
import { Home } from './components/home/home';
import { HotelRevenueManagement } from './components/hotel-revenue-management/hotel-revenue-management';
import { OtaDistributionStrategy } from './components/ota-distribution-strategy/ota-distribution-strategy';
import { HotelReputationReviews } from './components/hotel-reputation-reviews/hotel-reputation-reviews';
import { HotelDirectBooking } from './components/hotel-direct-booking/hotel-direct-booking';
import { IndianHospitalityIndustry } from './components/indian-hospitality-industry/indian-hospitality-industry';

@NgModule({
  declarations: [
    Home,
    HotelRevenueManagement,
    OtaDistributionStrategy,
    HotelReputationReviews,
    HotelDirectBooking,
    IndianHospitalityIndustry,
  ],
  imports: [CommonModule, PagesRoutingModule],
})
export class PagesModule {}
