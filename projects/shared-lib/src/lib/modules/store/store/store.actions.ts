import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {StoreDTO} from "@shared-lib/modules/store/dto/store";
import {PaginatedResponse} from "@shared-lib/models";
import {StoreFilterParams} from "@shared-lib/modules/store/dto/store.filter";
import {AppDetailDto} from "@shared-lib/modules/store/dto/app-detail";
import {ModelDetailDto} from "@shared-lib/modules/app-execution/dto/model";
import {StoreRatingCreateDTO, StoreRatingDTO} from "../dto/store.rating";
import {ToolGraphDTO, ToolGraphPathDTO} from "@shared-lib/modules/store/dto/tool-graph";

export const StoreActions = createActionGroup({
  source: 'Store',
  events: {
    'Load List': props<{ params?: StoreFilterParams }>(),
    'Load List Success': props<{ response: PaginatedResponse<StoreDTO> }>(),
    'Load List Failure': props<{ error: any }>(),

    'Load Next Page': emptyProps(),

    'Load Graph': props<{ params?: StoreFilterParams }>(),
    'Load Graph Success': props<{ response: ToolGraphDTO }>(),
    'Load Graph Failure': props<{ error: any }>(),

    'Load Graph Paths': props<{ params?: StoreFilterParams, from: number, to: number, many:number }>(),
    'Load Graph and Paths': props<{ params?: StoreFilterParams, from: number, to: number, many:number }>(),
    'Load Graph Paths Success': props<{ response: ToolGraphPathDTO[] }>(),
    'Load Graph Paths Failure': props<{ error: any }>(),

    'Load Model': props<{ id: number }>(),
    'Load Model Success': props<{ item: ModelDetailDto }>(),
    'Load Model Failure': props<{ error: any }>(),

    'Load App': props<{ idOrSlug: number | string }>(),
    'Load App By Version': props<{ appVersionId: number }>(),
    'Load App Success': props<{ item: AppDetailDto }>(),
    'Load App Failure': props<{ error: any }>(),

    'Load Apps By Versions': props<{ appVersionIds: number[] }>(),
    'Load Apps By Versions Success': props<{ items: AppDetailDto[] }>(),
    'Load Apps By Versions Failure': props<{ error: any }>(),

    'Load App Ratings': props<{ appId: number }>(),
    'Load App Ratings Success': props<{ appId: number; items: StoreRatingDTO[] }>(),
    'Load App Ratings Failure': props<{ appId: number; error: any }>(),

    'Load Model Ratings': props<{ modelId: number }>(),
    'Load Model Ratings Success': props<{ modelId: number; items: StoreRatingDTO[] }>(),
    'Load Model Ratings Failure': props<{ modelId: number; error: any }>(),

    'Create App Rating': props<{ appId: number; dto: StoreRatingCreateDTO }>(),
    'Create App Rating Success': props<{ appId: number; rating: StoreRatingDTO }>(),
    'Create App Rating Failure': props<{ appId: number; error: any }>(),

    'Create Model Rating': props<{ modelVersionId: number; dto: StoreRatingCreateDTO }>(),
    'Create Model Rating Success': props<{ modelVersionId: number; rating: StoreRatingDTO }>(),
    'Create Model Rating Failure': props<{ modelVersionId: number; error: any }>(),
  }
});
