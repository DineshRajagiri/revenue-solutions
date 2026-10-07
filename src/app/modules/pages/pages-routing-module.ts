import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TdsCalculator } from './components/tds-calculator/tds-calculator';
import { Home } from './components/home/home';

const routes: Routes = [
  { path: '', component: Home },
  { path: 'tds-calculator', component: TdsCalculator },
  { path: 'home', component: Home },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {}
