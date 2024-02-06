import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  updateLeaveDays(Employee_Id: any, updatedData: { Employee_Id: any; LeaveDays: any; RemovedRows: string[]; }) {
    throw new Error('Method not implemented.');
  }
  bulkInsert(dataWithUniqueIds: any[]) {
    throw new Error('Method not implemented.');
  }

  constructor( private http: HttpClient) { }

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };


  AddEmployee( employeeData : any):Observable<any>
  {
    const body = JSON.stringify(employeeData);

    console.log(employeeData);
    return this.http.post('http://localhost:8000/api/v1/employee',body,this.httpOptions);
  }

  getEmployee( ) {
    return this.http.get('http://localhost:8000/api/v1/employee');
  }

  deleteOne(Epl_id: any){
    return this.http.delete(`http://localhost:8000/api/v1/employee/${Epl_id}`);
  }

  upDateEmployee(Employee_Id:any,data: any){
    return this.http.patch(`http://localhost:8000/api/v1/employee/${Employee_Id}`,data);
  }

  bulkCreate(data: any): Observable<any> {
    return this.http.post(`http://localhost:8000/api/v1/employee/bulkInsert`, data);
  }

//<------------------------------------<<<<<<<Leavedays>>>>>>------------------------------------>

saveLeavedays(leavedaysData: any){
    return this.http.post('http://localhost:8000/api/v1/leavedays',leavedaysData);
}

getLeaveDays(){
  return this.http.get('http://localhost:8000/api/v1/leavedays');
}

DeleteLeaveDay(id: any){
  return this.http.delete(`http://localhost:8000/api/v1/leavedays/${id}`);
}

ImportLeaveDays(data: any): Observable<any> {
  return this.http.post(`http://localhost:8000/api/v1/leavedays/bulkinsert`, data);
}

//----------------------One to Many-------------------------------------------------------

getEmployeeLeaveDays(id : any){
  return this.http.get(`http://localhost:8000/api/v1/employee/employeeleavedays/${id}`);
}

DeleteEmployeeLeaveDays(id : any) {
  return this.http.delete(`http://localhost:8000/api/v1/employee/deleteleavedays/${id}`);
}

CreateEmployeeLeaveDays(data : any){
  return this.http.post(`http://localhost:8000/api/v1/employee/createleavedays/createAll`,data);
}

IMPORT(data:any){
  return this.http.post(`http://localhost:8000/api/v1/employee/importEmployeeLeaveDays/import`,data)
}

UpdateData(Employee_Id:any,updatedData:any){
  return this.http.post(`http://localhost:8000/api/v1/employee/updatedata/${Employee_Id}`,updatedData)
}

checkIfEmployeeExists(employeeId: string): Observable<boolean> {
  return this.http.get<{ exists: boolean }>(`http://localhost:8000/api/v1/employee/checkID/${employeeId}`)
    .pipe(
      map(response => response.exists), // Extract the exists property from the response
      catchError(() => {
        // Handle errors here, such as logging or displaying a message
        return of(false); // Return false assuming employee doesn't exist due to error
      })
    );
}
}


