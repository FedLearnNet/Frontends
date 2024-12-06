import {Component, OnInit} from '@angular/core';
import {ProjectDto} from "./dto/project";
import {EMPTY, map, Observable, Subscription} from "rxjs";
import {ControllerStatusDto} from "@shared-lib/controller/dto";
import {UserDto} from "@shared-lib/base/user";
import {ProjectService} from "@global-app/project/services/project-service";
import {MatTableDataSource} from "@angular/material/table";

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrl: './project.component.scss'
})
export class ProjectComponent{

}
