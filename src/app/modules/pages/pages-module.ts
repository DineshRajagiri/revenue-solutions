import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PagesRoutingModule } from './pages-routing-module';
import { TdsCalculator } from './components/tds-calculator/tds-calculator';

@NgModule({
  declarations: [TdsCalculator],
  imports: [CommonModule, PagesRoutingModule],
})
export class PagesModule {}
