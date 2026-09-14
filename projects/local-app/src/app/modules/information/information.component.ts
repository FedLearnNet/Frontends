import {ChangeDetectionStrategy, Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-information',
  template: '<router-outlet />',
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class InformationComponent {
}
