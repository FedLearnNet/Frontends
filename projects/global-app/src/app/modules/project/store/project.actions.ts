import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {ProjectCreateDto, ProjectDetailDto, ProjectDto} from '../dto/project';

export const ProjectActions = createActionGroup({
  source: 'Project',
  events: {
    'Load List': emptyProps(),
    'Load List Success': props<{ items: ProjectDto[] }>(),
    'Load List Failure': props<{ error: any }>(),

    'Load': props<{ id: number | string }>(),
    'Load Success': props<{ project: ProjectDetailDto }>(),
    'Load Failure': props<{ id: number | string; error: any }>(),

    'Create': props<{ dto: ProjectCreateDto }>(),
    'Create Success': props<{ project: ProjectDetailDto }>(),
    'Create Failure': props<{ error: any }>(),

    'Update': props<{ project: ProjectDetailDto }>(),
    'Update Success': props<{ project: ProjectDetailDto }>(),
    'Update Failure': props<{ error: any }>(),

    'Delete': props<{ id: number }>(),
    'Delete Success': props<{ id: number }>(),
    'Delete Failure': props<{ id: number; error: any }>(),

    'Upload File': props<{ projectId: number; file: File }>(),
    'Upload File Success': props<{ projectId: number; project: ProjectDetailDto }>(),
    'Upload File Failure': props<{ projectId: number; error: any }>(),

    'Select': props<{ id: number | null }>(),
    'Reset Errors': emptyProps(),
  },
});
