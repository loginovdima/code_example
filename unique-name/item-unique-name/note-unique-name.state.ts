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

import { NoteItemBusinessService } from "@torrow/business";
import { ErrorClientService } from "@torrow/core";
import { noteItemActions } from "@torrow/store-data";
import { TorrowError } from "@torrow/utils";

import * as noteUniqueNameActions from "./note-unique-name.actions";

export interface StateModel {
  readonly error?: TorrowError;
}

const initialState: StateModel = {
  error: undefined,
};

@State<StateModel>({
  defaults: initialState,
  name: "NOTE_UNIQUE_NAME",
})
export class NoteUniqueNameState {
  constructor(
    private readonly errorClientService: ErrorClientService,
    private readonly noteItemBusinessService: NoteItemBusinessService,
  ) { }

  @Action(noteUniqueNameActions.Init)
  public init(ctx: StateContext<StateModel>, action: noteUniqueNameActions.Init): Observable<void> {
    return ctx.dispatch(new noteItemActions.Get(action.payload))
      .pipe(
        catchError((error: TorrowError) => {
          return this.errorClientService.throwErrorAndNotify(error);
        }),
      );
  }

  @Action(noteUniqueNameActions.UpdateUniqueName)
  public updateUniqueName(
    ctx: StateContext<StateModel>,
    action: noteUniqueNameActions.UpdateUniqueName,
  ): Observable<void> {
    const { note, uniqueName } = action.payload;

    return this.noteItemBusinessService.updateUniqueName(note, uniqueName)
      .pipe(
        catchError((error: TorrowError) => {
          ctx.patchState({ error });

          return throwError(error);
        }),
      );
  }

}

export const getError = createSelector(
  [NoteUniqueNameState],
  (state: StateModel) => state.error,
);
