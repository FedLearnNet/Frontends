import {ActivatedRouteSnapshot, ResolveFn} from "@angular/router";
import {inject} from "@angular/core";
import {ProjectService} from "./project-service";
import {ProjectDetailDto} from "../dto/project";




export const projectResolver: ResolveFn<ProjectDetailDto> = (route: ActivatedRouteSnapshot) => {
  return inject(ProjectService).getProject(route.paramMap.get('projectId'));
}
