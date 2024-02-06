import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'gendatesearch'
})
export class GendatesearchPipe implements PipeTransform {    
    transform(getEmployeeS: any[], searchGender: string, searchDate: string): any[] {
  if (!Array.isArray(getEmployeeS) || (!searchGender && !searchDate)) {
    return getEmployeeS;
  }

  searchGender = searchGender ? searchGender.toLowerCase() : '';
  searchDate = searchDate ? searchDate.toLowerCase() : '';

  return getEmployeeS.filter((employee: any) => 
    (employee.gender && employee.gender.toString() === searchGender) ||
    (employee.date && employee.date.toLowerCase().includes(searchDate))
  );
}

}
