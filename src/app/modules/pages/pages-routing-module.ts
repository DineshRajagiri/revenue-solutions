import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TdsCalculator } from './components/tds-calculator/tds-calculator';

const routes: Routes = [
  { path: '', redirectTo: 'tds-calculator', pathMatch: 'full' },
  { path: 'tds-calculator', component: TdsCalculator },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {}
