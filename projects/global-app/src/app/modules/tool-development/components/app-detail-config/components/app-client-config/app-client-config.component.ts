import {Component, input} from '@angular/core';
import {MatExpansionModule} from "@angular/material/expansion";
import {ClientConfigDTO} from "../../../../dto/config";
import {TranslatePipe} from "@ngx-translate/core";
import {LocalFiles} from "@shared-lib/modules/files/dto/file";
import {
  FileProfileCardComponent
} from "@shared-lib/modules/files/components/file-profile-card/file-profile-card.component";


@Component({
  selector: 'app-app-client-config',
  imports: [
    MatExpansionModule,
    TranslatePipe,
    FileProfileCardComponent,
  ],
  templateUrl: './app-client-config.component.html',
  styleUrl: './app-client-config.component.scss'
})
export class AppClientConfigComponent {
  readonly config = input<ClientConfigDTO | undefined>(undefined);
  readonly datafiles = input<LocalFiles[]>([]);
}
