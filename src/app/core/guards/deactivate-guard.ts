import { CanDeactivateFn } from '@angular/router';
import { ICanDeactivate } from '../models/canDeactivate.model';

export const deactivateGuard: CanDeactivateFn<ICanDeactivate> = (
  component,
  currentRoute,
  currentState,
  nextState,
) => {


  return  component.canDeactivate ? component.canDeactivate() : true;
};
