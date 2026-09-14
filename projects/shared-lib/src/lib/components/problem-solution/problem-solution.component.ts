import {ChangeDetectionStrategy, Component, computed, input, output} from '@angular/core';
import {animate, query, stagger, style, transition, trigger} from "@angular/animations";
import {MatIcon} from "@angular/material/icon";
import {MatButton} from "@angular/material/button";


export interface ProblemSolutionStep {
  title: string;
  description: string;
  helper?: string;
  icon?: string;
}

@Component({
  selector: 'lib-problem-solution',
  imports: [
    MatIcon,
    MatButton
  ],
  templateUrl: './problem-solution.component.html',
  styleUrl: './problem-solution.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('sectionIn', [
      transition(':enter', [
        query(
          '[data-anim]',
          [
            style({opacity: 0, transform: 'translateY(10px)'}),
            stagger(70, animate('520ms cubic-bezier(.2,.9,.2,1)', style({opacity: 1, transform: 'translateY(0)'}))),
          ],
          {optional: true}
        ),
      ]),
    ]),
  ],
})
export class ProblemSolutionComponent {
  title = input.required<string>();
  subtitle = input<string | null>(null);

  problemTitle = input<string>('Problem');
  solutionTitle = input<string>('Solution');

  problems = input<ProblemSolutionStep[]>([]);
  solutions = input<ProblemSolutionStep[]>([]);

  ctaLabel = input<string>('See how it works');
  ctaIcon = input<string>('arrow_forward');
  cta = output<void>();

  hasSubtitle = computed(() => !!this.subtitle());
  hasProblems = computed(() => this.problems().length > 0);
  hasSolutions = computed(() => this.solutions().length > 0);
}
