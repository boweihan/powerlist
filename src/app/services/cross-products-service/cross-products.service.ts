import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs';
import { Ingredient } from '../../models/ingredient';

@Injectable()
export class CrossProductsService {

  constructor(
    private http: Http
  ) { }

  getCrossReferencedIngredients(products: string): Observable<Ingredient[]> {
    return this.http
      .get("https://ccrosser.herokuapp.com/cross_products?"+products)
      .map((r: Response) => r.json() as Ingredient[]);
  }
}
