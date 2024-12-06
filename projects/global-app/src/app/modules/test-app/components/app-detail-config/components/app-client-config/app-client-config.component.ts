import {Component, inject, Input} from '@angular/core';
import {JsonPipe} from "@angular/common";
import {MatExpansionModule} from "@angular/material/expansion";
import {ClientConfigDTO} from "../../../../dto/config";

@Component({
  selector: 'app-app-client-config',
  standalone: true,
  imports: [
    MatExpansionModule
  ],
  templateUrl: './app-client-config.component.html',
  styleUrl: './app-client-config.component.scss'
})
export class AppClientConfigComponent {
  @Input() config?: ClientConfigDTO;
  @Input() datafiles: string[] = [];
}
