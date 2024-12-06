import {Component, Input} from '@angular/core';
import {ExperimentRunDTO} from "../../../dto/experiment";

@Component({
  selector: 'app-experiment-run-circle',
  standalone: true,
  imports: [],
  templateUrl: './experiment-run-circle.component.html',
  styleUrl: './experiment-run-circle.component.scss'
})
export class ExperimentRunCircleComponent {

  @Input() run: ExperimentRunDTO;
}
