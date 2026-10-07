import {Component, input, ChangeDetectionStrategy} from '@angular/core';
import {ToolAuditDTO} from "../../dto/audit";
import {NgClass} from "@angular/common";
import {StatusBadgeComponent} from "@shared-lib/components/status-badge/status-badge.component";

@Component({
  selector: 'app-audit-card',
  imports: [
    NgClass,
    StatusBadgeComponent
  ],
  templateUrl: './audit-card.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './audit-card.component.scss',
})
export class AuditCardComponent {
  audit = input.required<ToolAuditDTO>();
}
