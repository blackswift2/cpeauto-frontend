import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowseComponent } from './components/pages/browse/browse/browse.component';
import { ImportComponent } from './components/pages/import/import/import.component';
import { ExportComponent } from './components/pages/export/export/export.component';
import { HeaderComponent } from './components/layout/header/header/header.component';
import { FooterComponent } from './components/layout/footer/footer/footer.component';
import { AddpartsComponent } from './components/pages/browse/addparts/addparts.component';
import { ConfirmModalComponent } from './components/layout/modals/confirm-modal/confirm-modal.component';

import { PartsService } from './services/PartsService';

@NgModule({
  declarations: [
    AppComponent,
    BrowseComponent,
    ImportComponent,
    ExportComponent,
    HeaderComponent,
    FooterComponent,
    AddpartsComponent,
    ConfirmModalComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    NgbModule,
    NgbPaginationModule,
  ],
  providers: [PartsService],
  bootstrap: [AppComponent],
})
export class AppModule {}
