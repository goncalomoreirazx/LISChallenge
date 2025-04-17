import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgrammerTasksComponent } from './programmer-tasks.component';

describe('ProgrammerTasksComponent', () => {
  let component: ProgrammerTasksComponent;
  let fixture: ComponentFixture<ProgrammerTasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgrammerTasksComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgrammerTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
