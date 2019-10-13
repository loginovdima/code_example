import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
} from "@angular/core";
import {
  ModalController,
  NavParams,
} from "@ionic/angular";
import { Store } from "@ngxs/store";
import { Observable } from "rxjs";
import {
  filter,
  skip,
  take,
  tap,
} from "rxjs/operators";

import { UniqueNameFormSubmitValue } from "@torrow/shared-dumb";
import {
  NoteClientItem,
  noteItemState,
} from "@torrow/store-data";
import {
  isExists,
  TorrowError,
} from "@torrow/utils";
import { ItemUniqueNameModal } from "./item-unique-name.modal";

import * as noteUniqueNameActions from "./note-unique-name.actions";
import * as noteUniqueNameState from "./note-unique-name.state";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: "tt-note-unique-name",
  templateUrl: "./item-unique-name.modal.html",
})
export class NoteUniqueNameModal extends ItemUniqueNameModal<NoteClientItem> implements OnInit {
  public readonly item$: Observable<Readonly<NoteClientItem>>;
  public readonly error$: Observable<TorrowError | undefined>;

  constructor(
    navParams: NavParams,
    modalController: ModalController,
    store: Store,
  ) {
    super(
      navParams,
      modalController,
      store,
    );

    this.item$ = this.store.select(noteItemState.getEntity(this.itemId))
      .pipe(
        filter(isExists),
        take(1),
      );
    this.error$ = this.store.select(noteUniqueNameState.getError)
      .pipe(
        skip(1),
      );
  }

  public ngOnInit(): void {
    this.store.dispatch(new noteUniqueNameActions.Init({ id: this.itemId }));
  }

  public onFormSubmit(uniqueNameFormSubmitValue: UniqueNameFormSubmitValue<NoteClientItem>): void {
    if (!this.uniqueNameFormComponent.stateChanged) {
      this.modalController.dismiss();

      return;
    }

    const note = uniqueNameFormSubmitValue.item;
    const uniqueName = uniqueNameFormSubmitValue.item.uniqueName;

    if (!!uniqueName || uniqueName === "") {
      this.store.dispatch(
        new noteUniqueNameActions.UpdateUniqueName({ note, uniqueName }),
      )
        .pipe(
          tap(() => this.modalController.dismiss()),
        )
        .subscribe();
    }
  }
}
