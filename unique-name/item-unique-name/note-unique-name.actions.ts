import { NoteClientItem } from "@torrow/store-data";

// tslint:disable:max-classes-per-file
export class Init {
  public static readonly type = "[Note Unique Name Modal] Init";

  constructor(public readonly payload: { readonly id: string }) {}
}

export class UpdateUniqueName {
  public static readonly type = "[Note Unique Name Modal] Update Unique Name";

  constructor(public readonly payload: {
    readonly note: NoteClientItem,
    readonly uniqueName: string,
  }) {}
}
