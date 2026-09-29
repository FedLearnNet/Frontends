import { Component, ChangeDetectionStrategy } from '@angular/core';
import {RouterOutlet} from "@angular/router";

@Component({
    selector: 'app-log',
    imports: [
        RouterOutlet
    ],
    templateUrl: './log.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './log.component.scss'
})
export class LogComponent {

}
