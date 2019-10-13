import {
  Action,
  createSelector,
  State,
  StateContext,
} from "@ngxs/store";
import {
  Observable,
  throwError,
} from "rxjs";
import { catchError } from "rxjs/operators";

import { ContactItemBusinessService } from "@torrow/business";
import { ErrorClientService } from "@torrow/core";
import { contactItemActions } from "@torrow/store-data";
import { TorrowError } from "@torrow/utils";

import * as contactUniqueNameActions from "./contact-unique-name.actions";

export interface StateModel {
  readonly error?: TorrowError;
}

const initialState: StateModel = {
  error: undefined,
};

@State<StateModel>({
  defaults: initialState,
  name: "CONTACT_UNIQUE_NAME",
})
export class ContactUniqueNameState {
  constructor(
    private readonly errorClientService: ErrorClientService,
    private readonly contactItemBusinessService: ContactItemBusinessService,
  ) { }

  @Action(contactUniqueNameActions.Init)
  public init(ctx: StateContext<StateModel>, action: contactUniqueNameActions.Init): Observable<void> {
    return ctx.dispatch(new contactItemActions.Get(action.payload))
      .pipe(
        catchError((error: TorrowError) => {
          return this.errorClientService.throwErrorAndNotify(error);
        }),
      );
  }

  @Action(contactUniqueNameActions.UpdateUniqueName)
  public updateUniqueName(
    ctx: StateContext<StateModel>,
    action: contactUniqueNameActions.UpdateUniqueName,
  ): Observable<void> {
    const { contact, uniqueName } = action.payload;

    return this.contactItemBusinessService.updateUniqueName(contact, uniqueName)
      .pipe(
        catchError((error: TorrowError) => {
          ctx.patchState({ error });

          return throwError(error);
        }),
      );
  }
}

export const getError = createSelector(
  [ContactUniqueNameState],
  (state: StateModel) => state.error,
);
