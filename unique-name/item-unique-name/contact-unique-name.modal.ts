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
  ContactClientItem,
  contactItemState,
} from "@torrow/store-data";
import {
  isExists,
  TorrowError,
} from "@torrow/utils";
import { ItemUniqueNameModal } from "./item-unique-name.modal";

import * as contactUniqueNameActions from "./contact-unique-name.actions";
import * as contactUniqueNameState from "./contact-unique-name.state";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: "tt-contact-unique-name",
  templateUrl: "./item-unique-name.modal.html",
})
export class ContactUniqueNameModal extends ItemUniqueNameModal<ContactClientItem> implements OnInit {
  public readonly item$: Observable<Readonly<ContactClientItem>>;
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

    this.item$ = this.store.select(contactItemState.getEntity(this.itemId))
      .pipe(
        filter(isExists),
        take(1),
      );
    this.error$ = this.store.select(contactUniqueNameState.getError)
      .pipe(
        skip(1),
      );
  }

  public ngOnInit(): void {
    this.store.dispatch(new contactUniqueNameActions.Init({ id: this.itemId }));
  }

  public onFormSubmit(uniqueNameFormSubmitValue: UniqueNameFormSubmitValue<ContactClientItem>): void {
    if (!this.uniqueNameFormComponent.stateChanged) {
      this.modalController.dismiss();

      return;
    }

    const contact = uniqueNameFormSubmitValue.item;
    const uniqueName = uniqueNameFormSubmitValue.item.uniqueName;

    if (!!uniqueName || uniqueName === "") {
      this.store.dispatch(
        new contactUniqueNameActions.UpdateUniqueName({ contact, uniqueName }),
      )
        .pipe(
          tap(() => this.modalController.dismiss()),
        )
        .subscribe();
    }
  }
}
