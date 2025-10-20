import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';

const documentMock = {
  createElement: () => ({}),
  querySelector: () => null,
  body: {},
};

beforeAll(() => {
  TestBed.configureTestingModule({
    providers: [{ provide: DOCUMENT, useValue: documentMock }]
  });
});
