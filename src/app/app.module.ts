import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { EmployeeFormComponent } from './employee-form/employee-form.component';
import { HttpClientModule } from '@angular/common/http';
import { GenderPipe } from './gender.pipe';
import { Ng2SearchPipeModule } from 'ng2-search-filter';

import { NgxPaginationModule } from 'ngx-pagination';
import { SearchPipe } from './search.pipe';
import { NrcvalidPipe } from './nrcvalid.pipe';
import { GendatesearchPipe } from './gendatesearch.pipe';
import { LeaveComponent } from './leave/leave.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';



// import { PaginationControlsModule } from 'ngx-pagination';

@NgModule({
  declarations: [
    AppComponent,
    EmployeeFormComponent,
    GenderPipe,
    SearchPipe,
    NrcvalidPipe,
    GendatesearchPipe,
    LeaveComponent,
    
    // searchPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    NgxPaginationModule,
    BsDropdownModule.forRoot(),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
