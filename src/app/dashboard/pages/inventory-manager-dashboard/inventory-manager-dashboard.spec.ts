import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryManagerDashboard } from './inventory-manager-dashboard';

describe('InventoryManagerDashboard', () => {
  let component: InventoryManagerDashboard;
  let fixture: ComponentFixture<InventoryManagerDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryManagerDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventoryManagerDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
