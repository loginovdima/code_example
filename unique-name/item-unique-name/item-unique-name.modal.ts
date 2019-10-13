import {
  HostBinding,
  ViewChild,
} from "@angular/core";
import {
  ModalController,
  NavParams,
} from "@ionic/angular";
import { Store } from "@ngxs/store";
import {
  Observable,
  of,
} from "rxjs";

import { ContextClientItem } from "@torrow/domain";
import { UniqueNameFormComponent } from "@torrow/shared-dumb";
import {
  contextItemState,
  TorrowItem,
} from "@torrow/store-data";
import { ItemUniqueNameProvider } from "./item-unique-name.provider";

export abstract class ItemUniqueNameModal<T extends TorrowItem> implements ItemUniqueNameProvider {
  public readonly i18nUniqueName = "ITEM_UNIQUE_NAME.uniqueName";
  public readonly itemId: string;
  public readonly rootContextId: string | undefined;

  public readonly rootContext$: Observable<Readonly<ContextClientItem> | undefined>;

  @HostBinding("attr.qa-id")
  public readonly qaId = "unique-name-page";

  @ViewChild(UniqueNameFormComponent, { static: false })
  public readonly uniqueNameFormComponent!: UniqueNameFormComponent<T>;

  constructor(
    private readonly navParams: NavParams,
    protected readonly modalController: ModalController,
    protected readonly store: Store,
  ) {
    const {
      itemId,
      rootContextId,
    } = this.navParams.data as ItemUniqueNameProvider;

    this.itemId = itemId;
    this.rootContextId = rootContextId;

    this.rootContext$ = !!this.rootContextId ?
      this.store.select(contextItemState.getEntity(this.rootContextId)) :
      of(undefined);
  }

  public onBack(): void {
    this.modalController.dismiss();
  }
}
