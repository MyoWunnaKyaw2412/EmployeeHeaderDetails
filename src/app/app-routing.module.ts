import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmployeeFormComponent } from './employee-form/employee-form.component';
import { LeaveComponent } from './leave/leave.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'employee-form',
    pathMatch: 'full'
  },
  {
    path: 'employee-form',
    component: EmployeeFormComponent
  },
  {
    path: 'leave',
    component: LeaveComponent
  },
  {
    path: 'leave/:id',
    component: LeaveComponent
  },
  {
    path: 'leave/addnew',
    component:LeaveComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
