import { TorrowItem } from "@torrow/store-data";

export interface UniqueNameFormSubmitValue<T extends TorrowItem> {
  readonly item: T;
}
