import { Pipe, PipeTransform } from '@angular/core';
import { AnonymousSubject } from 'rxjs/internal/Subject';

@Pipe({
  name: 'search'
})
export class SearchPipe implements PipeTransform {

  transform(getEmployeeS: any[], searchText: string, searchGender: string, searchDate: string): any[] {
    if (!Array.isArray(getEmployeeS)) {
        return getEmployeeS;
    }

    searchText = searchText ? searchText.toLowerCase() : '';
    searchGender = searchGender ? searchGender.toLowerCase() : '';
    searchDate = searchDate ? searchDate.toLowerCase() : '';

    return getEmployeeS.filter((employee: any) => 
        this.matchesSearch(employee, searchText, searchGender, searchDate)
    );
}

matchesSearch(employee: any, searchText: string, searchGender: string, searchDate: string): boolean {
    const normalizedSearchText = searchText.toLowerCase();

    return (
        (!searchText || 
            this.includesIgnoreCase(employee.Name, normalizedSearchText) ||
            this.includesIgnoreCase(employee.Employee_Id, normalizedSearchText) ||
            this.includesIgnoreCase(employee.Father_Name, normalizedSearchText) ||
            this.includesIgnoreCase(employee.NRC, normalizedSearchText)
        ) &&
        (searchGender === '' || 
            (typeof employee.Gender === 'boolean' && employee.Gender === (searchGender === 'male')) ||
            (searchGender === 'male' && typeof employee.Gender === 'string' && this.includesIgnoreCase(employee.Gender, 'Male')) ||
            (searchGender === 'female' && typeof employee.Gender === 'string' && this.includesIgnoreCase(employee.Gender, 'Female'))
        ) &&
        (searchDate === '' || 
            this.dateMatchesSearch(new Date(employee.DOB), searchDate)
        )
    );
}

includesIgnoreCase(value: any, searchText: string): boolean {
    return value && value.toString().toLowerCase().includes(searchText);
}

dateMatchesSearch(dob: Date, searchDate: string): boolean {
    return dob.toISOString().slice(0, 10) === searchDate;
}




}
