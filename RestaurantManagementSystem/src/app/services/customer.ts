import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Category, CreateSessionRequest, CreateSessionResponse, JoinSessionRequest, JoinSessionResponse, RequestType, TableInfo, ValidateSessionResponse } from '../models/customer.models';
import { baseUrl } from '../../environment';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Customer {
  constructor(private http: HttpClient) {}
  getTable(tableIdentifier: string) {
    return this.http.get<TableInfo>(
      `${baseUrl}/Customer/tables/${tableIdentifier}`
    );
  }
  createSession(tableIdentifier: string,request: CreateSessionRequest){
    return this.http.post<CreateSessionResponse>(
      `${baseUrl}/Customer/tables/${tableIdentifier}/sessions`,
      request
    );
  }
  joinSession(tableIdentifier: string,request: JoinSessionRequest){
    return this.http.post<JoinSessionResponse>(
      `${baseUrl}/Customer/tables/${tableIdentifier}/sessions/join`,
      request
    );
  }
  validateSession(){
    return this.http.get<ValidateSessionResponse>(
    `${baseUrl}/user/session/validate`
  );
  }
    sendRequest(requestType: RequestType) {
    return this.http.post(
      `${baseUrl}/Customer/requests`,
      { requestType },
      {
      responseType: 'text'
    }
    );
  }
}
