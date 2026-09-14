import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {
  ContainerDTO,
  ContainerLogDTO,
  ContainerRunDTO,
  InfoDTO,
  InspectVolumeResponseDTO
} from '@shared-lib/modules/admin/dto/orch';

export const OrchActions = createActionGroup({
  source: 'Orch',
  events: {
    'Reset State': emptyProps(),
    'Load Dashboard': emptyProps(),
    'Load Run Detail': props<{ id: number }>(),

    'Load Docker Info': emptyProps(),
    'Load Docker Info Success': props<{ info: InfoDTO }>(),
    'Load Docker Info Failure': props<{ error: any }>(),

    'Load Running Containers': emptyProps(),
    'Load Running Containers Success': props<{ containers: ContainerDTO[] }>(),
    'Load Running Containers Failure': props<{ error: any }>(),

    'Load Running Container': props<{ id: string }>(),
    'Load Running Container Success': props<{ container: ContainerDTO }>(),
    'Load Running Container Failure': props<{ id: string; error: any }>(),

    'Stream Running Logs': props<{ id: string }>(),
    'Stream Running Logs Message': props<{ id: string; message: string }>(),
    'Stream Running Logs Complete': props<{ id: string }>(),
    'Stream Running Logs Failure': props<{ id: string; error: any }>(),
    'Stop Running Logs Stream': props<{ id: string }>(),

    'Load Runs': emptyProps(),
    'Load Runs Success': props<{ runs: ContainerRunDTO[] }>(),
    'Load Runs Failure': props<{ error: any }>(),

    'Load Run': props<{ id: number }>(),
    'Load Run Success': props<{ run: ContainerRunDTO }>(),
    'Load Run Failure': props<{ id: number; error: any }>(),

    'Load Run Logs': props<{ id: number }>(),
    'Load Run Logs Success': props<{ id: number; logs: ContainerLogDTO[] }>(),
    'Load Run Logs Failure': props<{ id: number; error: any }>(),

    'Load Volumes': emptyProps(),
    'Load Volumes Success': props<{ volumes: InspectVolumeResponseDTO[] }>(),
    'Load Volumes Failure': props<{ error: any }>(),

    'Load Volume': props<{ name: string }>(),
    'Load Volume Success': props<{ volume: InspectVolumeResponseDTO }>(),
    'Load Volume Failure': props<{ name: string; error: any }>(),

    'Remove Volume': props<{ name: string }>(),
    'Remove Volume Success': props<{ name: string }>(),
    'Remove Volume Failure': props<{ name: string; error: any }>(),

    'Load Fc Containers': emptyProps(),
    'Load Fc Containers Success': props<{ containers: ContainerDTO[] }>(),
    'Load Fc Containers Failure': props<{ error: any }>(),

    'Cleanup Fc Containers': props<{ containerIds: string[]; cleanup: boolean }>(),
    'Cleanup Fc Containers Success': props<{ containerIds: string[] }>(),
    'Cleanup Fc Containers Failure': props<{ error: any }>(),
  }
});
