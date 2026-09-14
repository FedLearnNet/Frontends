import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {NotificationDTO} from '@shared-lib/base/notifications';
import {UserInformationDTO} from '@local-app/information/dto/information.dto';

export const NotificationActions = createActionGroup({
  source: 'Notifications',
  events: {
    'Load All': emptyProps(),
    'Load All Success': props<{ items: NotificationDTO[] }>(),
    'Load All Failure': props<{ error: any }>(),

    'Load User Info': emptyProps(),
    'Load User Info Success': props<{ info: UserInformationDTO }>(),
    'Load User Info Failure': props<{ error: any }>(),

    'Mark As Read': props<{ id: number }>(),
    'Mark As Read Success': props<{ updated: NotificationDTO }>(),
    'Mark As Read Failure': props<{ id: number; error: any }>(),

    'Archive': props<{ id: number }>(),
    'Archive Success': props<{ updated: NotificationDTO }>(),
    'Archive Failure': props<{ id: number; error: any }>(),

    'Delete': props<{ id: number }>(),
    'Delete Success': props<{ id: number }>(),
    'Delete Failure': props<{ id: number; error: any }>(),

    'Reset Errors': emptyProps(),
  },
});
