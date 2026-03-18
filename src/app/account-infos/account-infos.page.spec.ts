import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountInfosPage } from './account-infos.page';

describe('AccountInfosPage', () => {
  let component: AccountInfosPage;
  let fixture: ComponentFixture<AccountInfosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountInfosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
