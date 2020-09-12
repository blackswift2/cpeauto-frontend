import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PartsService {
  baseUri: string = `${environment.apiURL}/api/parts`;
  headers = new HttpHeaders().set('Content-Type', 'application/json');

  constructor(private http: HttpClient) {}

  // Get all parts
  getParts(): Observable<any> {
    return this.http.get(`${this.baseUri}`).pipe(
      map((res: Response) => {
        return res;
      })
    );
  }

  // Get single part by id
  getPartById(id): Observable<any> {
    let url = `${this.baseUri}/${id}`;
    return this.http.get(url, { headers: this.headers }).pipe(
      map((res: Response) => {
        return res || {};
      }),
      catchError(this.errorMgmt)
    );
  }

  // Create Part
  createPart(data): Observable<any> {
    let url = `${this.baseUri}`;
    return this.http.post(url, data).pipe(
      catchError((err) => {
        throw err;
      })
    );
  }

  // Create Part
  bulkCreatePart(data): Observable<any> {
    let url = `${this.baseUri}/bulkCreate`;
    return this.http.post(url, data).pipe(catchError(this.errorMgmt));
  }

  // Update Part
  updatePartById(id, data): Observable<any> {
    let url = `${this.baseUri}/${id}`;
    return this.http
      .put(url, data, { headers: this.headers })
      .pipe(catchError(this.errorMgmt));
  }

  /**
   * Delete single part or in bulk based on ids
   * @param ids
   */
  deletePart(ids): Observable<any> {
    let url = `${this.baseUri}`;
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: {
        data: ids,
      },
    };
    return this.http.delete(url, options).pipe(catchError(this.errorMgmt));
  }

  /**
   * Export Data Service Function
   * @param data - data is array of party numbers, response is csv file
   */
  exportData(data: any[]): Observable<any> {
    let url = `${this.baseUri}/exportparts`;
    return this.http
      .post(
        url,
        { data },
        {
          responseType: 'blob',
          headers: new HttpHeaders().append('Content-Type', 'application/json'),
        }
      )
      .pipe(catchError(this.errorMgmt));
  }

  // Error handling
  errorMgmt(error: HttpErrorResponse) {
    let errorMessage = '';
    console.log(error);
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.log(errorMessage);
    return throwError(errorMessage);
  }
}
