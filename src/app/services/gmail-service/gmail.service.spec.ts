/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { GmailService } from './gmail.service';

describe('GmailService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GmailService]
    });
  });

  it('should ...', inject([GmailService], (service: GmailService) => {
    expect(service).toBeTruthy();
  }));
});
