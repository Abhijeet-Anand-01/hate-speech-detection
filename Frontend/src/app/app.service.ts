import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class AppService {

  private _APIurl = "http://127.0.0.1:5000";
  constructor(private http: HttpClient) { }


  getPrediction() {
    return this.http.get(`${this._APIurl}/get_prediction`);
  }

  postPredictText(body: any) {
    body = {
      "text": body
    }
    return this.http.post(`${this._APIurl}/predict`, body);
  }


  getUsers() {
    return this.http.get(`${this._APIurl}/users`);
  }

  postUsers(body: any) {
    return this.http.post(`${this._APIurl}/users`, body);
  }
}
