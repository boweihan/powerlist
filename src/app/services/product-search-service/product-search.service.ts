import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs';
import { Product } from '../../models/product';

@Injectable()
export class ProductSearchService {

  constructor(
    private http: Http
  ) { }

  getProducts(term: string): Observable<Product[]> {
    return this.http
      .get("https://ccrosser.herokuapp.com/products?name="+term)
      .map((r: Response) => r.json() as Product[]);
  }
}
