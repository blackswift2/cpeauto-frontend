import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class PartsService {
  baseUri: string = 'http://localhost:3000/api/parts';
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
    return this.http.post(url, data).pipe(catchError(this.errorMgmt));
  }

  // Create Part
  bulkCreatePart(data): Observable<any> {
    console.log(data);
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

  // Delete part
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

  // Error handling
  errorMgmt(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.log(errorMessage);
    return throwError(errorMessage);
  }
}
