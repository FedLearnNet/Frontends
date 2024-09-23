import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import {ConnectorCard} from "../../../../models/connector-card";

@Component({
  selector: 'app-connector-cards',
  templateUrl: './cards.component.html',
  styleUrl: './cards.component.scss'
})
export class ConnectorStepCardsComponent {
  @Input() public data: ConnectorCard;
  @Input() public selected: boolean = false;

  @Input() public draggable?: boolean;
  @Input() public editable?: boolean;

  @Output() public edit: EventEmitter<void> = new EventEmitter<void>();

  public onEditClick(): void {
    this.edit.emit();
  }

}
