import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment as e2} from '@global-app/env/environment';
import {environment as e1} from '@local-app/env/environment';
import {GitlabCreateIssueDTO} from "@shared-lib/components/create-issue-dialog/gitliab-issue.dto";

@Injectable({providedIn: 'root'})
export class GitlabIssueService {
  private readonly http = inject(HttpClient);

  private readonly globalApiURL = e2.globalLearningApiUrl;
  private readonly localApiURL = e1.localLearningAPIURL;

  private readonly path = 'issue';

  private baseUrl(): string {
    if (this.localApiURL) {
      return `${this.localApiURL}/${this.path}`;
    }
    return `${this.globalApiURL}/${this.path}`;
  }

  createIssue(payload: GitlabCreateIssueDTO): Observable<void> {
    return this.http.post<void>(`${this.baseUrl()}`, payload);
  }
}
