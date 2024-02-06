import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nrcvalid'
})
export class NrcvalidPipe implements PipeTransform {

  transform(value: boolean): string {
    return value == true ? 'Yes' : 'No';
  }

}
