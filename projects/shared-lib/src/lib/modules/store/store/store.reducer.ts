import {createReducer, on} from '@ngrx/store';
import {StoreActions} from './store.actions';
import {StoreDTO} from "@shared-lib/modules/store/dto/store";
import {StoreFilterParams} from "@shared-lib/modules/store/dto/store.filter";
import {AppDetailDto} from "@shared-lib/modules/store/dto/app-detail";
import {ModelDetailDto} from "@shared-lib/modules/app-execution/dto/model";
import {StoreRatingDTO} from "@shared-lib/modules/store/dto/store.rating";
import {ToolGraphDTO, ToolGraphPathDTO} from "@shared-lib/modules/store/dto/tool-graph";

export const featureKey = 'store';

export interface StoreState {
  list: StoreDTO[];
  graph: ToolGraphDTO | null;
  graphsPath: ToolGraphPathDTO[] | null;
  totalItems: number;
  listRequestParams: StoreFilterParams;
  selectedModel: ModelDetailDto | null;
  appByVersionId: Record<number, AppDetailDto>;
  selectedApp: AppDetailDto | null;
  appRatings: Record<number, StoreRatingDTO[]>;
  modelVersionRatings: Record<number, StoreRatingDTO[]>;
  loading: boolean;
  error: any;
}

export const initialState: StoreState = {
  list: [],
  totalItems: 0,
  listRequestParams: {
    page: 0,
    size: 10,
    sort: 'name,asc',
    search: null,
    appTypes: [],
    privacyTechniques: [],
    minRating: null,
    showUncertified: true,
  },
  graph: null,
  graphsPath: null,
  selectedModel: null,
  selectedApp: null,
  appRatings: {},
  appByVersionId: {},
  modelVersionRatings: {},
  loading: false,
  error: null
};

export const storeReducer = createReducer(
  initialState,

  // List
  on(StoreActions.loadList, (s, {params}): StoreState => ({
    ...s,
    loading: true,
    error: null,
    listRequestParams: {...s.listRequestParams, ...params}
  })),
  on(StoreActions.loadListSuccess, (s, {response}): StoreState => ({
    ...s,
    list: s.listRequestParams.page && s.listRequestParams.page > 0
      ? [...s.list, ...response.results]
      : response.results,
    totalItems: response.totalCount,
    loading: false
  })),
  on(StoreActions.loadListFailure, (s, {error}): StoreState => ({...s, loading: false, error})),

  //graph
  on(StoreActions.loadGraph, (s, {params}): StoreState => ({
    ...s,
    loading: true,
    error: null,
    listRequestParams: {...s.listRequestParams, ...params}
  })),
  on(StoreActions.loadGraphSuccess, (s, {response}): StoreState => ({
    ...s,
    graph: response,
    loading: false
  })), on(StoreActions.loadGraphPaths, (s, {params}): StoreState => ({
    ...s,
    loading: true,
    error: null,
    listRequestParams: {...s.listRequestParams, ...params}
  })),
  on(StoreActions.loadGraphPathsSuccess, (s, {response}): StoreState => ({
    ...s,
    graphsPath: response,
    loading: false
  })),
  on(StoreActions.loadGraphPathsFailure, (s, {error}): StoreState => ({...s, loading: false, error})),

  // Model
  on(StoreActions.loadModel, (s): StoreState => ({...s, loading: true, error: null, selectedModel: null})),
  on(StoreActions.loadModelSuccess, (s, {item}): StoreState => ({...s, selectedModel: item, loading: false})),
  on(StoreActions.loadModelFailure, (s, {error}): StoreState => ({...s, loading: false, error})),

  // App
  on(StoreActions.loadApp, (s): StoreState => ({...s, loading: true, error: null, selectedApp: null})),
  on(StoreActions.loadAppByVersion, (s): StoreState => ({...s, loading: true, error: null, selectedApp: null})),
  on(StoreActions.loadAppSuccess, (s, {item}): StoreState => ({
    ...s,
    selectedApp: item,
    appByVersionId: item?.latestVersionId != null
      ? {...s.appByVersionId, [item.latestVersionId]: item}
      : s.appByVersionId,
    loading: false
  })),
  on(StoreActions.loadAppFailure, (s, {error}): StoreState => ({...s, loading: false, error})),
  on(StoreActions.loadAppsByVersions, (s): StoreState => ({...s, loading: true, error: null})),
  on(StoreActions.loadAppsByVersionsSuccess, (s, {items}): StoreState => {
    const merged = (items ?? []).reduce<Record<number, AppDetailDto>>((acc, it) => {
      const id = it?.latestVersionId;
      if (id == null) return acc;
      acc[id] = it;
      return acc;
    }, {...s.appByVersionId});

    return {
      ...s,
      appByVersionId: merged,
      loading: false
    };
  }),
  on(StoreActions.loadAppsByVersionsFailure, (s, {error}): StoreState => ({...s, loading: false, error})),

  //Ratings below
  on(StoreActions.loadAppRatings, (s): StoreState => ({...s, loading: true, error: null})),
  on(StoreActions.loadAppRatingsSuccess, (s, {appId, items}): StoreState => ({
    ...s, loading: false, appRatings: {...s.appRatings, [appId]: items}
  })),
  on(StoreActions.loadAppRatingsFailure, (s, {error}): StoreState => ({...s, loading: false, error})),

  // Load Model
  on(StoreActions.loadModelRatings, (s): StoreState => ({...s, loading: true, error: null})),
  on(StoreActions.loadModelRatingsSuccess, (s, {modelId, items}): StoreState => ({
    ...s, loading: false, modelVersionRatings: {...s.modelVersionRatings, [modelId]: items}
  })),
  on(StoreActions.loadModelRatingsFailure, (s, {error}): StoreState => ({...s, loading: false, error})),

  // Create App Rating
  on(StoreActions.createAppRating, (s): StoreState => ({...s, loading: true, error: null})),
  on(StoreActions.createAppRatingSuccess, (s, {appId, rating}): StoreState => {
    const list = s.appRatings[appId] ?? [];
    const existingIndex = list.findIndex(r => r.id === rating.id);
    if (existingIndex >= 0) {
      const newList = [...list];
      newList[existingIndex] = rating;
      return {...s, loading: false, appRatings: {...s.appRatings, [appId]: newList}};
    }
    return {...s, loading: false, appRatings: {...s.appRatings, [appId]: [rating, ...list]}};
  }),
  on(StoreActions.createAppRatingFailure, (s, {error}): StoreState => ({...s, loading: false, error})),

  // Create Model Rating
  on(StoreActions.createModelRating, (s): StoreState => ({...s, loading: true, error: null})),
  on(StoreActions.createModelRatingSuccess, (s, {modelVersionId, rating}): StoreState => {
    const list = s.modelVersionRatings[modelVersionId] ?? [];
    const existingIndex = list.findIndex(r => r.id === rating.id);
    if (existingIndex >= 0) {
      const newList = [...list];
      newList[existingIndex] = rating;
      return {...s, loading: false, appRatings: {...s.appRatings, [modelVersionId]: newList}};
    }
    return {...s, loading: false, appRatings: {...s.appRatings, [modelVersionId]: [rating, ...list]}};
  }),
  on(StoreActions.createModelRatingFailure, (s, {error}): StoreState => ({...s, loading: false, error})),
);
