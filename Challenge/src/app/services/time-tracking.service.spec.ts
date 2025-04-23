import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { TimeTrackingService } from './time-tracking.service';

describe('TimeTrackingService', () => {
  let service: TimeTrackingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TimeTrackingService]
    });
    service = TestBed.inject(TimeTrackingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});