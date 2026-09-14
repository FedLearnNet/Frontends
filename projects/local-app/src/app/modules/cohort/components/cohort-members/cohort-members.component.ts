import {Component, computed, inject, model, OnInit, signal} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatTableModule} from '@angular/material/table';
import {MatTooltipModule} from '@angular/material/tooltip';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {catchError, finalize, of, startWith} from 'rxjs';
import {ConfirmDialogComponent} from '@shared-lib/components/confirm-dialog/confirm-dialog.component';
import {HeaderComponent} from '@shared-lib/components/header/header.component';
import {PageWrapperComponent} from '@shared-lib/components/page-wrapper/page-wrapper.component';
import {EmptyStateComponent} from '@shared-lib/modules/app-execution/components/empty-state/empty-state.component';
import {CohortAvailableUserDto, CohortDetailDto, CohortMemberDto, CohortMemberType, isCohortDeleting} from '@local-app/cohort/models';
import {CohortService} from '@local-app/cohort/services/cohort.service';

@Component({
  selector: 'app-cohort-members',
  imports: [
    EmptyStateComponent,
    HeaderComponent,
    PageWrapperComponent,
    MatAutocompleteModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIcon,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatTooltipModule,
    ReactiveFormsModule,
    TranslatePipe,
  ],
  templateUrl: './cohort-members.component.html',
  styleUrl: './cohort-members.component.scss',
})
export class CohortMembersComponent implements OnInit {
  private readonly cohortService = inject(CohortService);
  private readonly dialog = inject(MatDialog);
  private readonly formBuilder = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  cohort = model<CohortDetailDto>();

  readonly displayedColumns = ['user', 'email', 'type', 'actions'];
  readonly memberTypes: CohortMemberType[] = ['MAINTAINER'];
  readonly isLoadingUsers = signal(false);
  readonly isSaving = signal(false);
  readonly addingMode = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly availableUsers = signal<CohortAvailableUserDto[]>([]);
  readonly pendingMemberTypes = signal<Record<number, CohortMemberType>>({});

  readonly addMemberForm = this.formBuilder.nonNullable.group({
    keycloakId: ['', Validators.required],
    type: ['MAINTAINER' as CohortMemberType, Validators.required],
  });
  readonly userSearchTerm = toSignal(
    this.addMemberForm.controls.keycloakId.valueChanges.pipe(startWith('')),
    {initialValue: ''}
  );

  readonly members = computed(() => this.cohort()?.members ?? []);
  readonly actionsDisabled = computed(() => isCohortDeleting(this.cohort()));

  readonly userById = computed(() => {
    const users = new Map<string, CohortAvailableUserDto>();
    for (const user of this.availableUsers()) {
      users.set(user.id, user);
    }
    return users;
  });

  readonly usersAvailableForAdd = computed(() => {
    const assignedIds = new Set(this.members().map(member => member.keycloakId));
    return this.availableUsers()
      .filter(user => !assignedIds.has(user.id))
      .sort((a, b) => this.getUserDisplayName(a).localeCompare(this.getUserDisplayName(b)));
  });

  readonly filteredUsersAvailableForAdd = computed(() => {
    const search = this.userSearchTerm().trim().toLowerCase();
    if (!search) {
      return this.usersAvailableForAdd();
    }

    return this.usersAvailableForAdd().filter(user =>
      [
        user.id,
        user.username,
        user.firstName,
        user.lastName,
        user.email,
        this.getUserDisplayName(user),
      ].some(value => value?.toLowerCase().includes(search))
    );
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoadingUsers.set(true);
    this.loadError.set(null);

    this.cohortService.getAllUsers().pipe(
      catchError(error => {
        this.loadError.set(error);
        return of([]);
      }),
      finalize(() => this.isLoadingUsers.set(false)),
    ).subscribe(users => this.availableUsers.set(users));
  }

  addMember(): void {
    if (this.actionsDisabled()) {
      return;
    }
    this.addMemberForm.markAllAsTouched();
    if (this.addMemberForm.invalid) {
      return;
    }

    const formValue = this.addMemberForm.getRawValue();
    const cohortId = this.cohort()?.id;
    if (!cohortId) {
      return;
    }
    this.isSaving.set(true);

    this.cohortService.addMember(cohortId, {
      cohortId,
      keycloakId: formValue.keycloakId,
      type: formValue.type,
    }).pipe(
      finalize(() => this.isSaving.set(false)),
    ).subscribe({
      next: member => {
        this.patchMembers([...this.members(), member]);
        this.pendingMemberTypes.update(values => ({
          ...values,
          [member.id]: member.type,
        }));
        this.addMemberForm.reset({
          keycloakId: '',
          type: 'MAINTAINER',
        });
        this.showSuccess('COHORT_MEMBERS.MEMBER_CREATED');
      },
      error: error => this.showError('ERROR.FAILED_TO_CREATE', 'COHORT_MEMBERS.MEMBER', error),
    });
  }

  setPendingMemberType(memberId: number, type: CohortMemberType): void {
    this.pendingMemberTypes.update(values => ({
      ...values,
      [memberId]: type,
    }));
  }

  getPendingMemberType(member: CohortMemberDto): CohortMemberType {
    return this.pendingMemberTypes()[member.id] ?? member.type;
  }

  isMemberDirty(member: CohortMemberDto): boolean {
    return this.getPendingMemberType(member) !== member.type;
  }

  updateMember(member: CohortMemberDto): void {
    if (this.actionsDisabled()) {
      return;
    }
    const type = this.getPendingMemberType(member);
    if (type === member.type) {
      return;
    }

    const cohortId = this.cohort()?.id;
    if (!cohortId) {
      return;
    }
    this.isSaving.set(true);
    this.cohortService.updateMember(cohortId, member.id, {
      ...member,
      cohortId,
      type,
    }).pipe(
      finalize(() => this.isSaving.set(false)),
    ).subscribe({
      next: updatedMember => {
        this.patchMembers(this.members().map(existing =>
          existing.id === updatedMember.id ? updatedMember : existing
        ));
        this.pendingMemberTypes.update(values => ({
          ...values,
          [updatedMember.id]: updatedMember.type,
        }));
        this.showSuccess('COHORT_MEMBERS.MEMBER_UPDATED');
      },
      error: error => this.showError('ERROR.FAILED_TO_UPDATE', 'COHORT_MEMBERS.MEMBER', error),
    });
  }

  deleteMember(member: CohortMemberDto): void {
    if (this.actionsDisabled()) {
      return;
    }
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.translate.instant('DIALOG.DELETE_COHORT_MEMBER.TITLE'),
        message: this.translate.instant('DIALOG.DELETE_COHORT_MEMBER.MESSAGE', {
          name: this.getMemberDisplayName(member),
        }),
        dismissButtonText: this.translate.instant('BUTTON.CANCEL'),
        confirmButtonText: this.translate.instant('BUTTON.DELETE'),
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        return;
      }

      const cohortId = this.cohort()?.id;
      if (!cohortId) {
        return;
      }

      this.isSaving.set(true);
      this.cohortService.deleteMember(cohortId, member.id).pipe(
        finalize(() => this.isSaving.set(false)),
      ).subscribe({
        next: () => {
          this.patchMembers(this.members().filter(existing => existing.id !== member.id));
          this.pendingMemberTypes.update(values => {
            const updated = {...values};
            delete updated[member.id];
            return updated;
          });
          this.showSuccess('COHORT_MEMBERS.MEMBER_DELETED');
        },
        error: error => this.showError('ERROR.FAILED_TO_DELETE', 'COHORT_MEMBERS.MEMBER', error),
      });
    });
  }

  getMemberDisplayName(member: CohortMemberDto): string {
    return this.getUserDisplayName(this.userById().get(member.keycloakId)) || member.keycloakId;
  }

  getMemberEmail(member: CohortMemberDto): string {
    return this.userById().get(member.keycloakId)?.email || member.keycloakId;
  }

  getUserDisplayName(user: CohortAvailableUserDto | undefined): string {
    if (!user) {
      return '';
    }

    const fullName = [user.firstName, user.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();

    return fullName || user.username || user.email || user.id;
  }

  getUserSecondaryText(user: CohortAvailableUserDto): string {
    return user.email || user.username || user.id;
  }

  private patchMembers(members: CohortMemberDto[]): void {
    this.cohort.update(cohort => ({
      ...cohort!,
      members,
    }));
  }

  private showSuccess(messageKey: string): void {
    this.snackBar.open(
      this.translate.instant(messageKey),
      this.translate.instant('BUTTON.CLOSE'),
      {
        duration: 3000,
        verticalPosition: 'top',
      },
    );
  }

  private showError(messageKey: string, entityKey: string, error: any): void {
    const errorMessage = error?.error ?? error?.message ?? error;
    this.snackBar.open(
      `${this.translate.instant(messageKey, {name: this.translate.instant(entityKey)})}: ${errorMessage}`,
      this.translate.instant('BUTTON.CLOSE'),
      {
        duration: 5000,
        verticalPosition: 'top',
      },
    );
  }

  toggleAddingMode() {
    if (this.actionsDisabled()) {
      return;
    }
    this.addingMode.update(a => !a);
  }
}
