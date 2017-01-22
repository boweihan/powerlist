import { Component, OnInit } from '@angular/core';
import { ProductSearchService } from '../../services/product-search-service/product-search.service';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Product } from '../../models/product';
import { Ingredient } from '../../models/ingredient';
import { CrossProductsService } from '../../services/cross-products-service/cross-products.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
  providers: [ProductSearchService, CrossProductsService]
})
export class ProductsComponent implements OnInit {
  products: Observable<Product[]>;
  crIngredients: Observable<Ingredient[]>;
  crNames = "";
  crossProducts = [];
  private searchTerms = new Subject<string>(); /* NOTE: subject for observable transformation */
  private crossTerms = new Subject<string>(); /* NOTE: subject for observable cross-reference */

  constructor(
    private productSearchService: ProductSearchService,
    private crossProductsService: CrossProductsService
  ) { }

  getProducts(term: string): void { /* NOTE: pushing into the observable stream */
    this.searchTerms.next(term);
  }
  
  addToCrossReference(term: string): void {
    if (!this.crNames.length) {
      this.crNames = this.crNames + "product[]=" + encodeURIComponent(term);
    } else {
      this.crNames = this.crNames + "&&product[]=" + encodeURIComponent(term);
    }
    this.crossTerms.next(this.crNames);
  }
  
  removeFromCrossReference(term: string): void {
    this.crNames = this.crNames.split("&&product[]=" + encodeURIComponent(term)).join("");
    this.crNames = this.crNames.split("product[]=" + encodeURIComponent(term) + "&&").join(""); /* NOTE: this sucks */
    this.crNames = this.crNames.split("product[]=" + encodeURIComponent(term)).join("");
    console.log(this.crNames);
    this.crossTerms.next(this.crNames);
  }
  
  addToProductArray(product) {
    if (this.crossProducts === [] || (this.crossProducts as any).includes(product) === false) { /* NOTE: this error is not a real error */
      this.crossProducts.push(product);  
      this.addToCrossReference(product.name);
    }
  }
  
  removeProduct(product) {
    for (let i=0;i<this.crossProducts.length;i++) {
      if (this.crossProducts[i].name === product.name) {
        this.removeFromCrossReference(product.name);
        this.crossProducts.splice(i, 1);
      }
    }
  }
  
  ngOnInit() {
    this.products = this.searchTerms
      .debounceTime(300)        // wait for 300ms pause in events
      .distinctUntilChanged()   // ignore if next search term is same as previous
      .switchMap(term => term   // switch to new observable each time
        ? this.productSearchService.getProducts(term)
        : Observable.of<Product[]>([]))
      .catch(error => {
        console.log(error);
        return Observable.of<Product[]>([]);
      });
      
    this.crIngredients = this.crossTerms
      .debounceTime(300)        // wait for 300ms pause in events
      .distinctUntilChanged()   // ignore if next search term is same as previous
      .switchMap(term => term   // switch to new observable each time
        ? this.crossProductsService.getCrossReferencedIngredients(term)
        : Observable.of<Ingredient[]>([]))
      .catch(error => {
        console.log(error);
        return Observable.of<Ingredient[]>([]);
      });
  }


}

