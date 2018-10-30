import { Component } from '@angular/core';
import { input } from './input';

import { VelocityService } from './velocity.service';

@Component({
  selector: 'app-root',
  template: `<div *ngFor="let outputLine of displayOutput">{{ outputLine | json }}</div>`
})
export class AppComponent {
  constructor(private velocityService: VelocityService) {}

  displayOutput;

  ngOnInit() {
    this.displayOutput = this.velocityService.validateAllInputs(input);
  }
}
