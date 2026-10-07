import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PagesRoutingModule } from './pages-routing-module';
import { TdsCalculator } from './components/tds-calculator/tds-calculator';
import { Home } from './components/home/home';

@NgModule({
  declarations: [TdsCalculator, Home],
  imports: [CommonModule, PagesRoutingModule],
})
export class PagesModule {}
