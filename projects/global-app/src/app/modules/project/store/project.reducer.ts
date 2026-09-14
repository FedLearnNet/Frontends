import {createReducer, on} from '@ngrx/store';
import {ProjectActions} from './project.actions';
import {ProjectDetailDto, ProjectDto} from '../dto/project';
import {FileDTO} from "@shared-lib/modules/files/dto/file";

export interface ProjectState {
  projects: ProjectDto[];
  selectedProject: ProjectDetailDto | null;
  currentUpload?: { progress: number; inProgress: boolean; result?: FileDTO };

  loading: boolean;
  error: any;
  errorById: { [id: number]: any };
}

export const initialProjectState: ProjectState = {
  projects: [],
  selectedProject: null,

  loading: false,
  error: null,
  errorById: {},
};

export const featureKey = 'project';

function upsertList(list: ProjectDto[], item: ProjectDto): ProjectDto[] {
  const idx = list.findIndex(p => p.id === item.id);
  if (idx === -1) return [...list, item];
  const next = [...list];
  next[idx] = item;
  return next;
}

export const projectReducer = createReducer(
  initialProjectState,

  on(ProjectActions.loadList, (state): ProjectState => ({
    ...state, loading: true, error: null,
  })),
  on(ProjectActions.loadListSuccess, (state, {items}): ProjectState => ({
    ...state, projects: items, loading: false, error: null,
  })),
  on(ProjectActions.loadListFailure, (state, {error}): ProjectState => ({
    ...state, loading: false, error,
  })),

  on(ProjectActions.load, (state): ProjectState => ({
    ...state, loading: true, error: null,
  })),
  on(ProjectActions.loadSuccess, (state, {project}): ProjectState => ({
    ...state,
    projects: upsertList(state.projects, project),
    selectedProject: project,
    loading: false,
    error: null,
    errorById: {...state.errorById, [Number(project.id)]: null},
  })),
  on(ProjectActions.loadFailure, (state, {id, error}): ProjectState => ({
    ...state,
    loading: false,
    error,
    errorById: {...state.errorById, [Number(id)]: error},
  })),

  on(ProjectActions.create, (state): ProjectState => ({
    ...state, loading: true, error: null,
  })),
  on(ProjectActions.createSuccess, (state, {project}): ProjectState => ({
    ...state,
    projects: [project, ...state.projects],
    selectedProject: project,
    loading: false,
    error: null,
  })),
  on(ProjectActions.createFailure, (state, {error}): ProjectState => ({
    ...state, loading: false, error,
  })),

  on(ProjectActions.update, (state): ProjectState => ({
    ...state, loading: true, error: null,
  })),
  on(ProjectActions.updateSuccess, (state, {project}): ProjectState => ({
    ...state,
    projects: upsertList(state.projects, project),
    selectedProject:
      state.selectedProject?.id === project.id ? project : state.selectedProject,
    loading: false,
    error: null,
  })),
  on(ProjectActions.updateFailure, (state, {error}): ProjectState => ({
    ...state, loading: false, error,
  })),

  on(ProjectActions.delete, (state): ProjectState => ({
    ...state, loading: true, error: null,
  })),
  on(ProjectActions.deleteSuccess, (state, {id}): ProjectState => ({
    ...state,
    projects: state.projects.filter(p => p.id !== id),
    selectedProject: state.selectedProject?.id === id ? null : state.selectedProject,
    loading: false,
    error: null,
  })),
  on(ProjectActions.deleteFailure, (state, {id, error}): ProjectState => ({
    ...state,
    loading: false,
    error,
    errorById: {...state.errorById, [Number(id)]: error},
  })),

  on(ProjectActions.uploadFile, (s): ProjectState => ({
    ...s,
    currentUpload: {progress: 0, inProgress: true},
    loading: true,
    error: null
  })),
  on(ProjectActions.uploadFileSuccess, (s, {project}): ProjectState => {
    return {
      ...s,
      projects: upsertList(s.projects, project),
      selectedProject:
        s.selectedProject?.id === project.id ? project : s.selectedProject,
      currentUpload: {progress: 100, inProgress: false, result: project.file},
      loading: false,
      error: null,
    };
  }),
  on(ProjectActions.uploadFileFailure, (s, {error}): ProjectState => ({
    ...s,
    currentUpload: {progress: 0, inProgress: false},
    loading: false,
    error
  })),


  on(ProjectActions.select, (state, {id}): ProjectState => ({
    ...state,
    selectedProject:
      id == null
        ? null
        : (state.selectedProject?.id === Number(id)
          ? state.selectedProject
          : state.selectedProject), // selection is a view concern; detail load uses ProjectActions.load
  })),

  on(ProjectActions.resetErrors, (state): ProjectState => ({
    ...state, error: null, errorById: {},
  })),
);
