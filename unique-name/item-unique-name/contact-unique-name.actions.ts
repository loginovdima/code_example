import { ContactClientItem } from "@torrow/store-data";

// tslint:disable:max-classes-per-file
export class Init {
  public static readonly type = "[Contact Unique Name Modal] Init";

  constructor(public readonly payload: { readonly id: string }) {}
}

export class UpdateUniqueName {
  public static readonly type = "[Contact Unique Name Modal] Update Unique Name";

  constructor(public readonly payload: {
    readonly contact: ContactClientItem,
    readonly uniqueName: string,
  }) {}
}
