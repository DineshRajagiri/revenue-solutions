import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LayoutRoutingModule } from './layout-routing-module';
import { Header } from './header/header';
import { Footer } from './footer/footer';
import { MainLayout } from './main-layout/main-layout';

@NgModule({
  declarations: [Header, Footer, MainLayout],
  imports: [CommonModule, LayoutRoutingModule],
})
export class LayoutModule {}
