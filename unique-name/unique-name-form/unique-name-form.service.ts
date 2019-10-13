import { Injectable } from "@angular/core";

import { TorrowItem } from "@torrow/store-data";

import { UniqueNameFormValue } from "./unique-name-form-value.model";

@Injectable({
  providedIn: "root",
})
export class UniqueNameFormService<T extends TorrowItem> {
  public buildFormValue(value?: T): UniqueNameFormValue {
    return {
      uniqueName: value && value.uniqueName || "",
    };
  }

  public buildModel(formValue: UniqueNameFormValue, item: T): T {
    return {
      ...item,
      uniqueName: formValue.uniqueName,
    };
  }
}
