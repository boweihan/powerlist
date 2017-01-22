/* tslint:disable:no-unused-variable */

import { TestBed, async } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';

describe('Component: Navbar', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        NavbarComponent
      ],
    });
  });

  it('should create an instance', () => {
    let component = new NavbarComponent();
    expect(component).toBeTruthy();
  });
});
