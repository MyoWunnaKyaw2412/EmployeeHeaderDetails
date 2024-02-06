import {  Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ServiceService } from '../services/service.service';
import { ChangeDetectorRef } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgModel } from '@angular/forms';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import { parse } from 'date-fns';
import { Router } from '@angular/router';


@Component({
  selector: 'app-employee-form',
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.css'],

  })
export class EmployeeFormComponent implements OnInit {

  
  fetchEmployees: any;
  snackBar: any;
  

  constructor(
    private employeeService: ServiceService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

    @ViewChild ('f') employeeform? : NgModel;
    @ViewChild ('Inputfile') Inputfile!:ElementRef; 

  Employee_Id!: number
  Name!: string;
  Father_Name!: string;
  DOB!: Date;
  Gender: boolean = true;
  NRC_Exists: boolean = true;
  NRC!: string;

  showSuccessMessage = false;
  showErrorMessage = false;
  showDate18yMessage = false;
  showUpdateMessage = false; 
  showDeleteMessage = false;
  showNeeDName = false;
  showUniqueIdMessage = false;
  showNeeDFather_Name = false;
  showDateFormatErrors = false;
  showGenderErrorMessage = false;
  showNRCExistsErrorMessage = false;
  showErrorMessageForImport = false;
  shwoSuccessImport = false;


  editArray:any = [];
  getEmployeeS:any = [];
  
  searchText: string = '';
  searchGender: string = '';
  searchDate : string = '';
  
  
  currentPage = 1;
  pageSize:number = 10;


  // onPageChange(pageNumber: number): void {
  //   this.currentPage = pageNumber;
  // }


  submit(){
    console.log(this.employeeform)
    console.log(this.employeeform?.valid)
  }
  
  ngOnInit(): void {

    this.GetEmployee();
    this.getEmployeeS.sort((a : any, b : any) => a.Employee_Id - b.Employee_Id);
   
  }

//---------------------------------

navigateToLeave(employeeId: string | null): void {
  const route = employeeId ? `/leave/${employeeId}` : '/leave/add';
  this.router.navigate([route]);
}


  trackByFn(index: number, item: any): any {
    return item.id; // Assuming 'id' is the unique identifier for each employee
  }

 

  async SaveEmployee( ) {

    if(this.isUnderAge()){

      
      this.showDate18yMessage = true;
  
      // Hide the success message after 3 seconds
      setTimeout(() => {
        this.showDate18yMessage = false;
      }, 3000);
      // alert("Employee must have 18years or above!");
    }
    else if(!this.Name){
      
      this.showNeeDName = true;
      // Hide the success message after 3 seconds
      setTimeout(() => {
        this.showNeeDName = false;
      }, 3000);

    }
    else if(!this.Father_Name) {

      this.showNeeDFather_Name = true;  
      // Hide the success message after 3 seconds
      setTimeout(() => {
        this.showNeeDFather_Name = false;
      }, 3000);

    }
    else{

      var EmployeeS =  {
        Employee_Id: this.Employee_Id,
        Name: this.Name,
        Father_Name: this.Father_Name,
        DOB: this.DOB,
        Gender: this.Gender,
        NRC_Exists: this.NRC_Exists,
        NRC: this.NRC,
      };
      console.log(EmployeeS);
      
      console.log(this.NRC_Exists);
  
      await this.employeeService.AddEmployee(EmployeeS).subscribe({
        next: (result: any) => {
          // Clear form values after saving
          this.Employee_Id = this.Employee_Id + 1;
          this.Name = '';
          this.Father_Name = '';
          this.DOB;
          this.Gender = true;
          this.NRC = '';
  
          this.getEmployeeS.push(EmployeeS);
          this.getEmployeeS.sort((a : any, b : any) => a.Employee_Id - b.Employee_Id);
  
          
          this.showSuccessMessage = true;
  
          // Hide the success message after 3 seconds
          setTimeout(() => {
            this.showSuccessMessage = false;
          }, 3000);
          console.log('Employee Saved Successfully', result);
          EmployeeS = result.data;
          console.log(this.getEmployeeS,"#>>>>>>>>>><<<<<<<<<<");
          this.GetEmployee();
        },
  
        error: (error: any) => {
          if (error && error.error && error.error.message === 'Employee ID already exists') {
            // Handle the specific error related to duplicate Employee_Id
            this.showErrorMessage = true;  
          // Hide the success message after 3 seconds
          setTimeout(() => {
          this.showErrorMessage = false;
          }, 3000);
            // Automatically close the alert after 3 seconds
            // this.snackBar.open('Error: Employee ID already exists.', '', { duration: 3000 });
          } else {
            // Handle other errors
            alert('Error Saving Employee');
            console.log('Error Saving Employee', error);
          }
        },
      });
    }

    // if (!this.isUnderAge() && this.Name && this.Father_Name) {
    //   const modalElement: any = document.getElementById('exampleModal');
    //   modalElement?.classList.remove('show');
    //   modalElement?.setAttribute('aria-hidden', 'true');
    //   document.body.classList.remove('modal-open');
    // }

  }

    async GetEmployee(){
       await this.employeeService.getEmployee().subscribe((result: any) => {
        this.getEmployeeS = result.data;

        this.getEmployeeS.sort((a: any, b: any) => a.Employee_Id - b.Employee_Id);
        console.log(result, "#Get Employee");
      })
    }

   DeleteEmployee(){
    this.employeeService.deleteOne(this.Employee_Id).subscribe({
      next: () => {
        // this.getEmployeeS = this.getEmployeeS.filter((employee:any) => employee.id !== id);
        console.log("Employee Deleted Successfully");
        this.showDeleteMessage = true;
  
      setTimeout(() => {
        this.showDeleteMessage = false;
      }, 3000);
        this.GetEmployee();
        this.getEmployeeS.sort((a: any, b: any) => a.Employee_Id - b.Employee_Id);     
      },
      error: (error: any) => {
        alert("Failed to Delete Employee");
        console.log("Failed to Delete Employee",error);
      }
    })
   } 

   UpdateEmployee( ){
      var UpdateData = {
      Name: this.editArray.Name,
      Father_Name: this.editArray.Father_Name,
      DOB: this.editArray.DOB,
      Gender: this.editArray.Gender,
      NRC_Exists: this.editArray.NRC_Exists,
      NRC: this.editArray.NRC,
      }
      console.log(UpdateData,"updateData");
      console.log(this.editArray.Employee_Id);
      console.log(this.editArray.Name);
      console.log(this.editArray.NRC_Exists)
      this.employeeService.upDateEmployee(this.editArray.Employee_Id,UpdateData).subscribe({
        next: (result: any) => {
          console.log("Update Successful",result);
           
      this.showUpdateMessage = true;
  
      // Hide the success message after 3 seconds
      setTimeout(() => {
        this.showUpdateMessage = false;
      }, 3000);
          this.GetEmployee();
        },
        error: (error: any) => {
          console.log("Error Updating Employee",error);
        }
      })
   }

   getEmployee_Id(id:number){
    return this.Employee_Id = id;
   }

   NewClear(){
    this.Employee_Id+1;
    this.Name = '';
    this.Father_Name = '';
    this.DOB ; Date.now();
    this.Gender = true;
    this.NRC_Exists = true;
    this.NRC = '';
   }

   clearNRC(){
    if(this.NRC_Exists == false){
       this.NRC = '';
    }
   }

   getEditArray(data: any){
    this.editArray = data;
    console.log(this.editArray);
   }

    isUnderAge(): boolean {
    if (!this.DOB) {
      return false; // No date provided, so no warning
    }

    const birthDate = new Date(this.DOB);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();

    return age < 18;
  }

  exportToExcel(data: any[], fileName: string): void {
    // Exclude unwanted columns (e.g., CreatedAt and UpdatedAt)
    const excludedColumns = ['createdAt', 'updatedAt'];
    const modifiedData = data.map(item => {
      const newItem = { ...item };
      excludedColumns.forEach(column => delete newItem[column]);
  
      // Map boolean values to strings
      newItem['Gender'] = newItem['Gender'] ? 'Female' : 'Male';
      
      newItem['NRC_Exists'] = newItem['NRC_Exists'] ? 'Yes' : 'No';
      return newItem;
    });
  
    // Convert modified data to Excel worksheet
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(modifiedData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  
    // Save the workbook to an Excel file
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  }
  
  importFromExcel(event: any): void {
    const file: File = event.target.files[0];
    const reader: FileReader = new FileReader();
  
    if (file) {
      reader.onload = (e: any) => {
        const binaryString: string = e.target.result;
        const workbook: XLSX.WorkBook = XLSX.read(binaryString, { type: 'binary' });
        const sheetName: string = workbook.SheetNames[0];
        const worksheet: XLSX.WorkSheet = workbook.Sheets[sheetName];
        const importedData: any[] = XLSX.utils.sheet_to_json(worksheet, { raw: true });
  
        // Validate and map 'Gender' values to boolean (false for male, true for female)
        for (const row of importedData) {
          if (this.isValidGender(row, event)) {
            // Continue with existing code
          } else {
            return; // Exit function if gender is invalid
          }
          // Validate and map 'NRC_Exists' values to boolean (false for No, true for Yes)
          if (this.isValidNRCExists(row, event)) {
            // Continue with existing code
          } else {
            return; // Exit function if NRC_Exists is invalid
          }
        }
        const isValid = this.validateExcelData(importedData);
        if (isValid) {
          this.employeeService.bulkCreate(importedData).subscribe({
            next: (result: any) => {
              console.log("Excel data saved successfully", result);
              this.shwoSuccessImport = true;
              setTimeout(() => {
                this.shwoSuccessImport = false;
                this.resetFileInput(event);
              }, 3000);
              this.GetEmployee();
              this.resetFileInput(event);
            },
            error: (error: any) => {
              console.log("Employee_Id already exists")
              this.showErrorMessageForImport = true;
                setTimeout(() => {
                  this.showErrorMessageForImport = false;
                  this.resetFileInput(event);
                }, 3000);
              if (error && error.error && error.error.message === 'One or more IDs already exist in the database') {
                this.showErrorMessageForImport = true;
                setTimeout(() => {
                  this.showErrorMessageForImport = false;
                  this.resetFileInput(event);
                }, 3000);
              }
            },
          });
        } else {
          this.showUniqueIdMessage = true;
          setTimeout(() => {
          this.showUniqueIdMessage = false;
          this.resetFileInput(event);
    }, 3000);
        }
      };
      reader.readAsBinaryString(file);
    }
  }
  
  // Validate and map 'Gender' values to boolean (false for male, true for female)
  isValidGender(row: any, event: any): boolean {
    const lowerCaseGender = (row.Gender || '').toLowerCase();
    if (lowerCaseGender === 'male' || lowerCaseGender === 'female') {
      row.Gender = lowerCaseGender === 'female';
      return true;
    } else {
      this.showGenderErrorMessage = true;
      setTimeout(() => {
        this.showGenderErrorMessage = false;
        this.resetFileInput(event);
      }, 3000);
      return false;
    }
  }
  
  // Validate and map 'NRC_Exists' values to boolean (false for No, true for Yes)
  isValidNRCExists(row: any, event: any): boolean {
    const lowerCaseNRCExists = (row.NRC_Exists || '').toLowerCase();
    if (lowerCaseNRCExists === 'yes' || lowerCaseNRCExists === 'no') {
      row.NRC_Exists = lowerCaseNRCExists === 'yes';
      return true;
    } else {
      this.showNRCExistsErrorMessage = true;
    setTimeout(() => {
      this.showNRCExistsErrorMessage = false;
      this.resetFileInput(event);
    }, 3000);
      return false;
    }
  }

  resetFileInput(event: any): void {
    event.target.value = null;
  }
  
  validateExcelData(importedData: any[]): boolean {
    const idSet = new Set();
  
    for (const row of importedData) {
      // Check if ID is a number
      if (isNaN(row.Employee_Id) || typeof row.Employee_Id !== 'number') {
        return false;
      }
  
      // Check for duplicate IDs
      if (idSet.has(row.Employee_Id)) {
        return false;
      }
  
      idSet.add(row.Employee_Id);
    }
  
    return true;
  }
  
  clickInput(){
  this.Inputfile.nativeElement.click();
  }

  routetoLeaveTemplate(){
  this.router.navigate(['leave']);
  }


get filteredEmployees(): any[] {
  const normalizedSearchText = this.searchText.toLowerCase();
  const normalizedSearchGender = this.searchGender.toLowerCase();
  const normalizedSearchDate = this.searchDate.toLowerCase();

  return this.getEmployeeS.filter((employee:any) =>
    (!normalizedSearchText ||
      this.includesIgnoreCase(employee.Name, normalizedSearchText) ||
      this.includesIgnoreCase(employee.Employee_Id, normalizedSearchText) ||
      this.includesIgnoreCase(employee.Father_Name, normalizedSearchText) ||
      this.includesIgnoreCase(employee.NRC, normalizedSearchText)) &&
    (!normalizedSearchGender ||
      this.includesIgnoreCase(employee.Gender, normalizedSearchGender)) &&
    (!normalizedSearchDate ||
      this.dateMatchesSearch(new Date(employee.DOB), normalizedSearchDate))
  );
}

includesIgnoreCase(value: any, searchText: string): boolean {
  return value && value.toString().toLowerCase().includes(searchText);
}

dateMatchesSearch(dob: Date, searchDate: string): boolean {
  return dob.toISOString().slice(0, 10) === searchDate;
}

isAnySearchFieldNotEmpty(): boolean {
  return this.searchText !== '' || this.searchGender !== '' || this.searchDate !== '';
}

applyFilter(): void {
  if (this.isAnySearchFieldNotEmpty()) {
    // Add your logic to use the filteredEmployees array as needed
    console.log(this.filteredEmployees);
  }
}
}



 