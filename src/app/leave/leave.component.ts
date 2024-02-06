import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterEvent } from '@angular/router';
import { ServiceService } from '../services/service.service';
import { NgModel } from '@angular/forms';
import { every, filter, switchMap } from 'rxjs';
import * as XLSX from 'xlsx';
import { constructFrom } from 'date-fns';
import { NgZone } from '@angular/core';
import { FormLeaveModel } from './leave';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-leave',
  templateUrl: './leave.component.html',
  styleUrls: ['./leave.component.css']
})
export class LeaveComponent implements OnInit {

  @ViewChild ('Inputfile') Inputfile!:ElementRef; 
  employeeData: any;


constructor(
  private router: Router,
  private leavedaysService: ServiceService,
  private employeeleaveRoute: ActivatedRoute,
  private ngZone : NgZone,
  ){}

  ngOnInit(): void {


    // this.employeeleaveRoute.url.subscribe(url => {
    //   const currentRoute = url[0].path; // Assuming the first segment of the route contains the path

    //   // Check if the current route is leave/:id
    //   if (currentRoute === 'leave' && this.emplo.snapshot.params.id) {
    //     this.disableEmployeeIdField = true;
    //   } else {
    //     this.disableEmployeeIdField = false;
    //   }
    // });
  
    this.employeeleaveRoute.params.subscribe((params) => {
      this.Employee_Id = +params['id'];
      
      if (isNaN(this.Employee_Id) || this.Employee_Id <= 0) {
        // Clear form fields if the Employee_Id is not valid
        this.disableEmployeeIdField = false;
      } else {
        this.disableEmployeeIdField = true;
      }
    });




    this.employeeleaveRoute.params.subscribe((params) => {
      this.Employee_Id = +params['id'];
      
      if (isNaN(this.Employee_Id) || this.Employee_Id <= 0) {
        // Clear form fields if the Employee_Id is not valid
        this.clearFormFields();
      } else {
        this.GetEmployeeLeaveDays();
      }
    });

    // Load saved leave data from localStorage
    this.loadDataFromStorage();


    // this.employeeleaveRoute.params.subscribe((params) => {
    //   this.Employee_Id = +params['id'];
      
    //   if (isNaN(this.Employee_Id) || this.Employee_Id <= 0) {
    //     // Clear form fields if the Employee_Id is not valid
    //     this.clearFormFields();
    //   } else {
    //     this.GetEmployeeLeaveDays();
    //     // this.loadDataFromStorage();
    //   }
    // });

    // this.employeeleaveRoute.params.subscribe((params) => {
    //   this.Employee_Id = +params['id'];
      
    //   this.GetEmployeeLeaveDays();
    //   this.loadDataFromStorage();
    // });
  }

  LeaveDays: any = [];
  leaveDatas: FormLeaveModel[] = [];
  employeeLeaveDatas:any = {};
  originalImportedData: any[] = [];
  removedRows: string[] = [];



  Employee_Id!: any
  Name!: string;
  Father_Name!: string;
  DOB!: Date;
  Gender: boolean = true;
  NRC_Exists: boolean = true;
  NRC!: string;

  disableEmployeeIdField = false;

  LeaveSaveSuccessMessage = false;
  LeaveDaysDeleteMessage = false;
  ErrorSavingMessage = false;
  ErropMessage = false;
  ErrBFMessage = false;
  ErrLYMessage = false;
  showSuccessImport = false;
  showErrorMessageForImport =false;
  showGenderErrorMessage = false;
  showNRCExistsErrorMessage = false;
  leavetypes:string[] = [
    'Casual',
    'Annual',
    'Medical',
    'Hospitalization',
    'Without',
    'Paid',
    'Maternity'
  ]

  LeavecarryForwards: string[] = [
    'Yes',
    'No'
  ]
  

  onInputChange(newValue: string) {
    for (let leaveData of this.leaveDatas){
      const maxLength = 4;
    let sanitizedValue = newValue.replace(/\D/g, ''); // Remove non-numeric characters

    // Limit length
    if (sanitizedValue.length > maxLength) {
      sanitizedValue = sanitizedValue.slice(0, maxLength);
    }

    leaveData.Leave_Year = parseInt(sanitizedValue, 10);
    }
  }

  getleaveday_id(id:number){
    return this.LeaveDays.id = id;
  }
  getEmployeeLeaveDays_ID(id : any){
    return this.Employee_Id = id;
  }

//-------------------------- save to loacl storage ----------------------------------------------------------------

loadDataFromStorage() {
  if (this.Employee_Id !== null) {
    const key = `formData_${this.Employee_Id }`;
    const storedData = localStorage.getItem(key);
    if (storedData) {
      this.leaveDatas = JSON.parse(storedData);
    }
  }
}

saveDataToStorage() {
  if (this.Employee_Id !== null) {
    const key = `formData_${this.Employee_Id}`;
    localStorage.setItem(key, JSON.stringify(this.leaveDatas));
  }
}

//--------------------Save to local storage--------------------------------------------------------------------

  addRow() {
  const newFormLeaveModel : FormLeaveModel = new FormLeaveModel();
  this.leaveDatas.push(newFormLeaveModel);
  this.saveDataToStorage() ;
}

removeRow(index: number) {
  // Check if the index is valid
  if (index >= 0 && index < this.leaveDatas.length) {
    // Remove the row at the specified index from the LeaveDays array
    this.leaveDatas.splice(index, 1);

    // Remove the corresponding row from the originalImportedData array if it exists
    if (index < this.originalImportedData.length) {
      const removedEmployeeId = this.originalImportedData[index].Employee_Id;
      this.originalImportedData.splice(index, 1);
      this.removedRows.push(removedEmployeeId);
    }
  }
}



//   removeRow(index: number) {
//   this.leaveDatas.splice(index, 1);
// }

  routetoList() {
    // Use the router to navigate to the 'employee-form' page
    this.router.navigate(['employee-form']);
  }

  routetolistTemplate(){
    this.router.navigate(['employee-form']);
  }

  convertYesNoToBoolean(value : any) {
    return value === 'Yes';
}

  DeleteOneleaveDay(id:number){
    console.log(id);
    this.leavedaysService.DeleteLeaveDay(id).subscribe({
      next: () => {
        console.log("Leave Day Deleted Successfully");
        this.LeaveDaysDeleteMessage = true;
  
      // Hide the success message after 3 seconds
      setTimeout(() => {
        this.LeaveDaysDeleteMessage = false;
      }, 3000);
        this.GetEmployeeLeaveDays();
      },
      error: (error: any) => {
        alert("Failed to Delete Leave Day");
        console.log("Failed to Delete Leave Day",error);
      }
    })
  }

  DeleteEmployeeLeaveDays( ) {

    this.leavedaysService.DeleteEmployeeLeaveDays(this.Employee_Id).subscribe({
      next: () => {
        console.log("Employee's Leave Day Deleted Successfully");
        this.LeaveDaysDeleteMessage = true;
        this.routetolistTemplate();
      // Hide the success message after 3 seconds
      setTimeout(() => {
        this.LeaveDaysDeleteMessage = false;
      }, 3000);
        this.GetEmployeeLeaveDays();
      },
      error: (error: any) => {
        alert("Failed to Delete Leave Day");
        console.log("Failed to Delete Leave Day",error);
      }
    })
  }

  convertBooleanToYesNo(value:any) {
    return value ? 'Yes' : 'No';
}

  convertTobolintruefalse(value : any){
    return value? true : false
}

  //--------------------------------------------------------<Save>--------------------------------------------------->

 
  streamRemainLeaveDaysCalculation(){
    for( const leaveData of this.leaveDatas){

      leaveData.Remaining_Leave_Days = leaveData.Number_of_Leave_Days + leaveData.Opening_Leave_Days +leaveData.Brought_Forward - leaveData.Taken_Leave_Days
    }
  }

  convertToBoolean(value: any): boolean {
    if (typeof value === 'boolean') {
      return value;
    }
  
    if (typeof value === 'string') {
      // Convert string to boolean
      return value.toLowerCase() === 'true';
    }
  
    return Boolean(value); // Fallback to a general boolean conversion
  }

  resetLeaveForm(){
    const newLeaveForm: FormLeaveModel = new FormLeaveModel();
    this.leaveDatas.push(newLeaveForm);
  }


  navigateToLeaveAdd(): void {
    // Call the method to clear form fields
    this.clearFormFields();
    
    // Navigate to the 'leave/add' route
    this.router.navigate(['leave/add']);
  }

  //---------<Get Function>--------------------------------------------------------------------->
  GetEmployeeLeaveDays() {
    this.leavedaysService.getEmployeeLeaveDays(this.Employee_Id).subscribe((result: any) => {
      console.log(result, "#CompleteResultObject");

      this.employeeLeaveDatas = result.data[0];
      // this.LeaveDays= result.data[0].leavedays;
      this.leaveDatas= result.data[0].leavedays.map((item:any) => ({
        ...item,
        Carry_Forward: this.convertBooleanToYesNo(item.Carry_Forward)
        // item.Carry_Forward.toString()
        // this.convertBooleanToYesNo(item.Carry_Forward)
        // Add similar lines for other boolean properties if needed
    }));
      console.log(this.employeeLeaveDatas, "#EmployeeLeaveDaysDatas");

      console.log(this.leaveDatas,"#LDLDLDLDLD")
  
      if (this.employeeLeaveDatas && this.employeeLeaveDatas.leavedayS) {
        console.log("Leave Days:", this.employeeLeaveDatas.leavedayS);
      }
    });
  }

 //----------------<Export To Excel>------------------------------------------------------------>
  exportToExcelWithEmployeeData(): void {
    // Fetch employee data and leave data for the specific Employee_ID
    this.leavedaysService.getEmployeeLeaveDays(this.Employee_Id).subscribe((result: any) => {
      const employeeData = {
        Employee_Id: result.data[0].Employee_Id,
        Name: result.data[0].Name,
        Father_Name: result.data[0].Father_Name,
        DOB: result.data[0].DOB,
        Gender: result.data[0].Gender ? 'Female' : 'Male',
        NRC_Exists: result.data[0].NRC_Exists ? 'Yes' : 'No',
        NRC: result.data[0].NRC
      };

      const leaveData = result.data[0].leavedays.map((item: any) => ({
        Leave_Type: item.Leave_Type,
        Number_of_Leave_Days: item.Number_of_Leave_Days,
        Opening_Leave_Days: item.Opening_Leave_Days,
        Brought_Forward: item.Brought_Forward,
        Taken_Leave_Days: item.Taken_Leave_Days,
        Remaining_Leave_Days: item.Remaining_Leave_Days,
        Leave_Year: item.Leave_Year,
        Carry_Forward: item.Carry_Forward ? 'Yes' : 'No'
      }));

      const dataToExport = [employeeData, ...leaveData]; // Combine employee and leave data

      // Create a new workbook
      const workbook: XLSX.WorkBook = XLSX.utils.book_new();

      // Convert data to a worksheet
      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);

      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'EmployeeLeaveData');

      // Generate a unique file name for the Excel file
      const fileName: string = 'EmployeeLeaveData_' + new Date().getTime() + '.xlsx';

      // Save the workbook as a file
      XLSX.writeFile(workbook, fileName);
    });
  }
//------------------------------<Excel Import>--------------------------------------------------->
  handleFileInput(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.ExcelImport(file);
      this.resetFileInput();
      this.router.navigate(['leave/add']);
    }
 }

  ExcelImport(file: any) {
    const reader = new FileReader();

    reader.onload = (e) => {
        if (e.target) {
            try {
                const binaryString = e.target.result;
                const workbook = XLSX.read(binaryString, { type: 'binary' });

                workbook.SheetNames.forEach(sheetName => {
                    const worksheet = workbook.Sheets[sheetName];
                    const excelData = XLSX.utils.sheet_to_json(worksheet, { raw: true });

                    if (excelData.length === 0) {
                        throw new Error('No data found in the Excel file.');
                    }

                    if (!this.isEmployeeIdFormatted(excelData)) {
                      alert('Invalid Employee_Id format. Please ensure all Employee_Id values are numeric.');
                      throw new Error('Invalid Employee_Id format. Please ensure all Employee_Id values are numeric.');
                  }

                    // Group data by Employee_Id
                    const groupedData = this.groupDataByEmployeeId(excelData);

                    // Process data for each Employee_Id
                    this.processEmployeeData(groupedData);
                    this.saveImportedDataToStorage(groupedData);
                });
            } catch (error) {
                console.error('Error reading Excel file:', error);
                alert('Error reading Excel file. Please check the console for details.');
            }
        } else {
            console.error('Event target is null.');
            alert('Event target is null. Cannot read file.');
        }
    };
    reader.readAsBinaryString(file);
}


groupDataByEmployeeId(excelData: any[]): { [key: string]: any[] } {
    const groupedData: { [key: string]: any[] } = {};

    excelData.forEach(entry => {
        const employeeId = entry.Employee_Id;
        if (!groupedData[employeeId]) {
            groupedData[employeeId] = [];
        }
        groupedData[employeeId].push(entry);
    });

    return groupedData;
}

async processEmployeeData(groupedData: { [key: string]: any[] }) {
    for (const employeeId of Object.keys(groupedData)) {
        const formattedData = this.formatEmployeeData(employeeId, groupedData[employeeId]);
        await this.sendDataToBackend(formattedData);
    }
}


isEmployeeIdFormatted(data: any[]): boolean {
    const employeeIdPattern = /^\d+$/;

    for (const entry of data) {
        if (!employeeIdPattern.test(entry.Employee_Id)) {
            return false;
        }
    }

    return true;
}


// formatEmployeeData(employeeId: string, data: any[]): any[] {
//   const validLeaveTypes = ['Casual', 'Medical', 'Hospitalization', 'Without', 'Paid', 'Maternity'];
//   const formattedData: any[] = [];

//   for (const entry of data) {
//       const leaveType = entry.Leave_Type;

//       // Check if the leave type is among the valid leave types
//       if (!validLeaveTypes.includes(leaveType)) {
//         alert(`Invalid leave type '${leaveType}'. Please enter a valid leave type.`);
//         throw new Error(`Invalid leave type '${leaveType}'. Please enter a valid leave type.`);
          
//       }

//       // Validate numeric fields
//       const numericFields = ['Number_of_Leave_Days', 'Opening_Leave_Days', 'Brought_Forward', 'Taken_Leave_Days', 'Leave_Year'];
//       for (const field of numericFields) {
//           if (isNaN(entry[field])) {
//             alert(`Invalid value for '${field}'. Please enter a numeric value.`);
//               throw new Error(`Invalid value for '${field}'. Please enter a numeric value.`);
              
//           }
//       }

//       // Validate Carry_Forward
//       const carryForward = entry.Carry_Forward.toLowerCase();
//       if (carryForward !== 'yes' && carryForward !== 'no') {
//           alert(`Invalid value for 'Carry_Forward'. Please enter either 'Yes' or 'No'.`);
//           throw new Error(`Invalid value for 'Carry_Forward'. Please enter either 'Yes' or 'No'.`);
//       }

//       // Calculate remaining leave days
//       const remainingLeaveDays = entry.Number_of_Leave_Days + entry.Opening_Leave_Days + entry.Brought_Forward - entry.Taken_Leave_Days;

//       const formattedEntry = {
//           Employee_Id: employeeId,
//           Name: entry.Name,
//           Father_Name: entry.Father_Name,
//           DOB: entry.DOB,
//           Gender: this.convertToBoolean(entry.Gender),
//           NRC_Exists: entry.NRC_Exists,
//           NRC: entry.NRC,
//           LeaveDays: [{
//               Leave_Type: leaveType,
//               Number_of_Leave_Days: entry.Number_of_Leave_Days,
//               Opening_Leave_Days: entry.Opening_Leave_Days,
//               Brought_Forward: entry.Brought_Forward,
//               Taken_Leave_Days: entry.Taken_Leave_Days,
//               Remaining_Leave_Days: remainingLeaveDays,
//               Leave_Year: entry.Leave_Year,
//               Carry_Forward: carryForward
//           }]
//       };

//       formattedData.push(formattedEntry);
//   }

//   return formattedData;
// }

formatEmployeeData(employeeId: string, data: any[]): any[] {
  const validLeaveTypes = ['Casual', 'Medical', 'Hospitalization', 'Without', 'Paid', 'Maternity'];
  const formattedData: any[] = [];

  for (const entry of data) {
      // Validate Employee_Id
      if (!/^-?\d+\.?\d*$/.test(entry.Employee_Id)) {
          throw new Error(`Invalid Employee_Id '${entry.Employee_Id}'. Please enter a numeric value.`);
      }

      // Validate Gender
      const gender = entry.Gender.toLowerCase();
      let isMale = false;
      if (gender === 'male') {
          isMale = true;
      }

      // Validate NRC_Exists
      const nrcExists = entry.NRC_Exists.toLowerCase();
      if (nrcExists !== 'yes' && nrcExists !== 'no') {
          throw new Error(`Invalid value for 'NRC_Exists'. Please enter either 'Yes' or 'No'.`);
      }

      const leaveType = entry.Leave_Type;

      // Check if the leave type is among the valid leave types
      if (!validLeaveTypes.includes(leaveType)) {
          throw new Error(`Invalid leave type '${leaveType}'. Please enter a valid leave type.`);
      }

      // Validate numeric fields
      const numericFields = ['Number_of_Leave_Days', 'Opening_Leave_Days', 'Brought_Forward', 'Taken_Leave_Days', 'Leave_Year'];
      for (const field of numericFields) {
          if (isNaN(entry[field])) {
              throw new Error(`Invalid value for '${field}'. Please enter a numeric value.`);
          }
      }

      // Validate Carry_Forward
      const carryForward = entry.Carry_Forward.toLowerCase();
      if (carryForward !== 'yes' && carryForward !== 'no') {
          throw new Error(`Invalid value for 'Carry_Forward'. Please enter either 'Yes' or 'No'.`);
      }

      // Calculate remaining leave days
      const remainingLeaveDays = entry.Number_of_Leave_Days + entry.Opening_Leave_Days + entry.Brought_Forward - entry.Taken_Leave_Days;

      const formattedEntry = {
          Employee_Id: employeeId,
          Name: entry.Name,
          Father_Name: entry.Father_Name,
          DOB: entry.DOB,
          Gender: isMale, 
          NRC_Exists: nrcExists === 'yes' ? 'Yes' : 'No',
          NRC: entry.NRC,
          LeaveDays: [{
              Leave_Type: leaveType,
              Number_of_Leave_Days: entry.Number_of_Leave_Days,
              Opening_Leave_Days: entry.Opening_Leave_Days,
              Brought_Forward: entry.Brought_Forward,
              Taken_Leave_Days: entry.Taken_Leave_Days,
              Remaining_Leave_Days: remainingLeaveDays,
              Leave_Year: entry.Leave_Year,
              Carry_Forward: carryForward
          }]
      };

      formattedData.push(formattedEntry);
  }

  return formattedData;
}


async sendDataToBackend(data: any[]) {

    // Iterate over each Employee_Id in the Excel data
    for (const employeeData of data) {
        try {
            const exists = await firstValueFrom(this.checkEmployeeExists(employeeData.Employee_Id));
            if (exists) {
                await this.importLeaveDays(employeeData);
                this.saveImportedDataToStorage(employeeData);
            } else {
                await this.createEmployeeAndLeaveDays(employeeData);
            }
        } catch (error) {
            console.error('Error processing data:', error);
            this.saveImportedDataToStorage(employeeData);
            // Handle error according to your application logic
        }
    }
}

handleRowDelete(employeeId: string) {
  // Add the ID of the removed row to removedRows array
  this.removedRows.push(employeeId);
  // Remove the row from UI
}


async saveModifiedDataToDatabase() {
  try {
      // Filter out removed rows from the original imported data
      const dataToSave = this.originalImportedData.filter(employeeData => !this.removedRows.includes(employeeData.Employee_Id));
      
      // Save dataToSave to the database
      await this.sendDataToBackend(dataToSave);
      
      // Reset removedRows array after successful save
      this.removedRows = [];
  } catch (error) {
      console.error('Error saving modified data to the database:', error);
      // Handle error as per your application requirements
  }
}

// async saveModifiedDataToDatabase() {
//   try {
//       // Filter out removed rows from the original imported data
//       const dataToSave = this.originalImportedData.filter(employeeData => !this.removedRows.includes(employeeData.Employee_Id));
      
//       // Save dataToSave to the database
//       // Reset removedRows array after successful save
//       this.removedRows = [];
//   } catch (error) {
//       console.error('Error saving modified data to the database:', error);
//   }
// }

async importLeaveDays(employeeData: any) {
  try {
      // Import LeaveDays data
      const res = await firstValueFrom(this.leavedaysService.IMPORT([employeeData]));
      console.log(res, 'response');
      this.showSuccessImport = true;
      setTimeout(() => {
          this.showSuccessImport = false;
      }, 3000);
      this.GetEmployeeLeaveDays();

      // Save imported data to originalImportedData
      this.originalImportedData.push(employeeData);
  } catch (err) {
      console.error('Error importing data for Employee_Id ' + employeeData.Employee_Id + ':', err);
      this.showErrorMessageForImport = true;
      setTimeout(() => {
          this.showErrorMessageForImport = false;
      }, 3000);
  }
}


calculateRemainingLeaveDays(entry: any): number {
    const numberLeaveDays = entry['Number_of_Leave_Days'];
    const openingLeaveDays = entry['Opening_Leave_Days'];
    const broughtForward = entry['Brought_Forward'];
    const takenLeaveDays = entry['Taken_Leave_Days'];

    // Ensure that all required properties are defined before calculation
    if (numberLeaveDays !== undefined && openingLeaveDays !== undefined && broughtForward !== undefined && takenLeaveDays !== undefined) {
        // Calculate Remaining_Leave_Days
        const remainingLeaveDays = numberLeaveDays + openingLeaveDays + broughtForward - takenLeaveDays;
        // Ensure that remainingLeaveDays is not negative
        return Math.max(0, remainingLeaveDays);
    } else {
        console.error('Some leave day properties are undefined.');
        return 0; // Return 0 or handle the error according to your application logic
    }
}


async SaveEmployeeAndLeaveDatas() {
  
  const EmployeeLeaveDatas = {
    Employee_Id: this.Employee_Id,
    Name: this.employeeLeaveDatas.Name,
    Father_Name: this.employeeLeaveDatas.Father_Name,
    DOB: this.employeeLeaveDatas.DOB,
    Gender: this.employeeLeaveDatas.Gender,
    NRC_Exists: this.convertToBoolean(this.employeeLeaveDatas.NRC_Exists),
    NRC: this.employeeLeaveDatas.NRC,
    LeaveDays: this.leaveDatas.map((item) => ({
      ...item,
      Carry_Forward: item.Carry_Forward === true ? 'Yes' : 'No'
      // this.convertTobolintruefalse(item.Carry_Forward)
    }))
  };

  try {

    const employeeExists = await this.leavedaysService.checkIfEmployeeExists(this.Employee_Id);

    if (employeeExists) {
      await firstValueFrom(this.leavedaysService.UpdateData(this.Employee_Id, EmployeeLeaveDatas));
    } else {
      await firstValueFrom(this.leavedaysService.CreateEmployeeLeaveDays(EmployeeLeaveDatas));
    }

    this.LeaveSaveSuccessMessage = true;
    setTimeout(() => {
      this.LeaveSaveSuccessMessage = false;
    }, 3000);

    this.GetEmployeeLeaveDays();

  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
      alert(err.message);
    } else {
      console.error('An unknown error occurred:', err);
      alert('An unknown error occurred.');
    }
  }
}


saveImportedDataToStorage(employeeData: any) {
  // Get existing data from localStorage or initialize as an empty array
  const existingData = JSON.parse(localStorage.getItem('importedData') || '[]');

  // Add the new employeeData to the existing data array
  existingData.push(employeeData);

  // Save the updated data back to localStorage
  localStorage.setItem('importedData', JSON.stringify(existingData));
}

async createEmployeeAndLeaveDays(employeeData: any) {
  try {
      // Create employee and LeaveDays
      const res = await firstValueFrom(this.leavedaysService.CreateEmployeeLeaveDays(employeeData));
      console.log(res, 'response');
      this.showSuccessImport = true;
      setTimeout(() => {
          this.showSuccessImport = false;
      }, 3000);
      this.GetEmployeeLeaveDays();

      // Save imported data to originalImportedData
      this.originalImportedData.push(employeeData);
  } catch (err) {
      console.error('Error importing data for Employee_Id ' + employeeData.Employee_Id + ':', err);
      this.showErrorMessageForImport = true;
      setTimeout(() => {
          this.showErrorMessageForImport = false;
      }, 3000);
  }
}

  
  DeleteEmployeeLeavedays(employeeId: string) {
    // Delete existing LeaveDays for the specified Employee_Id
    return this.leavedaysService.DeleteEmployeeLeaveDays(employeeId);
}

  checkEmployeeExists(employeeId: string) {
    // Call your service method to check if the employee exists
    return this.leavedaysService.checkIfEmployeeExists(employeeId);
}
  //-----that's ok fro calculate----------------------------------->
//   calculateRemainingLeaveDays(entry: any): number {
//     const numberLeaveDays = entry['Number_of_Leave_Days'];
//     const openingLeaveDays = entry['Opening_Leave_Days'];
//     const broughtForward = entry['Brought_Forward'];
//     const takenLeaveDays = entry['Taken_Leave_Days'];

//     // Ensure that all required properties are defined before calculation
//     if (numberLeaveDays !== undefined && openingLeaveDays !== undefined && broughtForward !== undefined && takenLeaveDays !== undefined) {
//         // Calculate Remaining_Leave_Days
//         const remainingLeaveDays = numberLeaveDays + openingLeaveDays + broughtForward - takenLeaveDays;
//         // Ensure that remainingLeaveDays is not negative
//         return Math.max(0, remainingLeaveDays);
//     } else {
//         console.error('Some leave day properties are undefined.');
//         return 0; // Return 0 or handle the error according to your application logic
//     }
// }



  //   sendDataToBackend(data: any[]) {
//     // Iterate over each Employee_Id in the Excel data
//     for (const employeeData of data) {
//       // Delete existing LeaveDays for the current Employee_Id
//       this.DeleteEmployeeLeavedays(employeeData.Employee_Id)
//         .pipe(
//           switchMap(() => {
//             // After successful deletion, import new LeaveDays
//             return this.leavedaysService.IMPORT([employeeData]);
//           })
//         )
//         .subscribe({
//           next: (res: any) => {
//             console.log(res, 'response');
//             this.showSuccessImport = true;
//             setTimeout(() => {
//               this.showSuccessImport = false;
//             }, 3000);
//             this.GetEmployeeLeaveDays();
//           },
//           error: (err: any) => {
//             console.error('Error importing data for Employee_Id ' + employeeData.Employee_Id + ':', err);
//             this.showErrorMessageForImport = true;
//             setTimeout(() => {
//               this.showErrorMessageForImport = false;
//             }, 3000);
//           },
//         });
//     }
//   }

// createEmployeeAndLeaveDays(employeeData: any) {
//   this.leavedaysService.CreateEmployeeLeaveDays(employeeData)
//       .subscribe((response: any) => ({
//                   next: (res: any) => {
//                       console.log(res, 'response');
//                       this.showSuccessImport = true;
//                       setTimeout(() => {
//                           this.showSuccessImport = false;
//                       }, 3000);
//                       this.GetEmployeeLeaveDays();
//                   },
//                   error: (err: any) => {
//                       console.error('Error importing data for Employee_Id ' + employeeData.Employee_Id + ':', err);
//                       this.showErrorMessageForImport = true;
//                       setTimeout(() => {
//                           this.showErrorMessageForImport = false;
//                       }, 3000);
//                   },
              
//       }));
// }



//--------------------is OK---------------------------------------------------------
  // sendDataToBackend(data: any[]) {
  //   // Iterate over each Employee_Id in the Excel data
  //   for (const employeeData of data) {
  //     // Delete existing LeaveDays for the current Employee_Id
  //     this.DeleteEmployeeLeavedays(employeeData.Employee_Id)
  //       .pipe(
  //         switchMap(() => {
  //           // After successful deletion, import new LeaveDays
  //           return this.leavedaysService.IMPORT([employeeData]);
  //         })
  //       )
  //       .subscribe({
  //         next: (res: any) => {
  //           console.log(res, 'response');
  //           this.shwoSuccessImport = true;
  //           setTimeout(() => {
  //             this.shwoSuccessImport = false;
  //           }, 3000);
  //           this.GetEmployeeLeaveDays();
  //         },
  //         error: (err: any) => {
  //           console.error('Error importing data for Employee_Id' + employeeData.Employee_Id + ':', err);
  //           this.showErrorMessageForImport = true;
  //           setTimeout(() => {
  //             this.showErrorMessageForImport = false;
  //           }, 3000);
  //         },
  //       });
  //   }
  // }


  // sendDataToBackend(data: any[]) {
  //   // Extract employee data and leave days
  //   const employeeData = data[0];
  //   const leaveDays = data.slice(1);
  //   // Check if employee data and leave days are provided
  //   if (!employeeData || !employeeData.Name || leaveDays.length === 0) {
  //     console.error('Please provide a valid Name and at least one leave day.');
  //     alert('Please provide a valid Name and at least one leave day.');
  //     return;
  //   }
  
  //   // Ensure required fields are present
  //   if (!employeeData.Employee_Id || !employeeData.DOB || !employeeData.Gender || !employeeData.NRC_Exists || !employeeData.NRC) {
  //     console.error('Please provide a valid Employee_Id, DOB, Gender, NRC_Exists, and NRC.');
  //     alert('Please provide a valid Employee_Id, DOB, Gender, NRC_Exists, and NRC.');
  //     return;
  //   }

  //   // Validate leave types
  //   const validLeaveTypes = ['Casual', 'Medical', 'Hospitalization', 'Without', 'Paid', 'Maternity'];
  //   for (const leaveDay of leaveDays) {
  //       if (!leaveDay.Leave_Type || !validLeaveTypes.includes(leaveDay.Leave_Type)) {
  //           console.error('Invalid or missing Leave_Type detected.');
  //           alert('Invalid or missing Leave_Type detected.');
  //           return;
  //       }

  //       leaveDay.Remaining_Leave_Days = this.calculateRemainingLeaveDays(leaveDay);
  //       // Calculate Remaining_Leave_Days
  //       // leaveDay.Remaining_Leave_Days = leaveDay.Number_of_Leave_Days + leaveDay.Opening_Leave_Days + leaveDay.Brought_Forward - leaveDay.Taken_Leave;
  //   }
  
  //   // Prepare the request payload
  //   const requestData = {
  //     Employee_Id: employeeData.Employee_Id,
  //     Name: employeeData.Name,
  //     Father_Name: employeeData.Father_Name,
  //     DOB: employeeData.DOB,
  //     Gender: this.convertToBoolean(employeeData.Gender),
  //     NRC_Exists: employeeData.NRC_Exists,
  //     NRC: employeeData.NRC,
  //     LeaveDays: leaveDays
  //   };
  
  //   // Call the service method to send data to the backend
  //   this.leavedaysService.IMPORT(requestData).subscribe({
  //     next: (res: any) => {
  //       console.log(res, 'response');
  //       alert('Data imported successfully.');
  //       this.addRow();
  //       this.GetEmployeeLeaveDays();
  //     },
  //     error: (err: any) => {
  //       console.error('Error importing data:', err);
  //       alert('Error importing data. Please check the console for details.');
  //     },
  //   });
  // }


  validateCarryForward(row: any): boolean {
    const lowerCaseCarryForward = (row.Carry_Forward || '').toLowerCase();
    if (lowerCaseCarryForward === 'yes' || lowerCaseCarryForward === 'no') {
        row.Carry_Forward = lowerCaseCarryForward === 'yes';
        return true;
    } else {
        return false;
    }
  }


  resetFileInput(): void {
  this.Inputfile.nativeElement.value = null;
  }

  clickImportInput(){
    this.Inputfile.nativeElement.click();
  }

  // Method to clear form fields
  clearFormFields(): void {
    console.log('Clearing form fields...');
    this.Employee_Id = null;
    console.log('Employee_Id cleared:', this.Employee_Id);
    this.employeeLeaveDatas.Name = " ";
    this.employeeLeaveDatas.Father_Name = " ";
    this.employeeLeaveDatas.DOB = new Date(); // Set DOB to null
    this.employeeLeaveDatas.Gender = false;
    this.employeeLeaveDatas.NRC_Exists = false;
    this.employeeLeaveDatas.NRC = "";
    this.leaveDatas = []; // Clear the leaveDatas array
  }
  

}
