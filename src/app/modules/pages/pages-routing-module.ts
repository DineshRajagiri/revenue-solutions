import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Home } from './components/home/home';
import { HotelRevenueManagement } from './components/hotel-revenue-management/hotel-revenue-management';
import { OtaDistributionStrategy } from './components/ota-distribution-strategy/ota-distribution-strategy';
import { HotelReputationReviews } from './components/hotel-reputation-reviews/hotel-reputation-reviews';
import { HotelDirectBooking } from './components/hotel-direct-booking/hotel-direct-booking';
import { IndianHospitalityIndustry } from './components/indian-hospitality-industry/indian-hospitality-industry';

const routes: Routes = [
  { path: '', component: Home },
  { path: 'home', component: Home },
  { path: 'hotel-revenue-management', component: HotelRevenueManagement },
  { path: 'ota-distribution-strategy', component: OtaDistributionStrategy },
  { path: 'hotel-reputation-reviews', component: HotelReputationReviews },
  { path: 'hotel-direct-booking', component: HotelDirectBooking },
  { path: 'indian-hospitality-industry', component: IndianHospitalityIndustry},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule { }
