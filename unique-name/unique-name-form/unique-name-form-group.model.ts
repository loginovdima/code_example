import {
  FormControl,
  Validators,
} from "@angular/forms";

import { uniqueNameCharactersValidator } from "@torrow/core";
import { ExtendedFormGroup } from "@torrow/utils";

export class UniqueNameFormGroup extends ExtendedFormGroup {
  public static readonly maxLengthUniqueName = 40;
  public static readonly minLengthUniqueName = 5;

  constructor() {
    super({
      uniqueName: new FormControl(
        "",
        {
          validators: [
            Validators.maxLength(UniqueNameFormGroup.maxLengthUniqueName),
            Validators.minLength(UniqueNameFormGroup.minLengthUniqueName),
            uniqueNameCharactersValidator,
          ],
        },
      ),
    });
  }
}
