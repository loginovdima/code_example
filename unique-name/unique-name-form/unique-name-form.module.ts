import { NgModule } from "@angular/core";

import { TorrowUiModule } from "@torrow/torrow-ui";
import { VendorModule } from "@torrow/vendor";

import { ValidationMessagesModule } from "../validation-messages";
import { UniqueNameFormComponent } from "./unique-name-form.component";

const DECLARATIONS = [
  UniqueNameFormComponent,
];

@NgModule({
  declarations: DECLARATIONS,
  exports: DECLARATIONS,
  imports: [
    VendorModule,
    TorrowUiModule,
    ValidationMessagesModule,
  ],
})
export class UniqueNameFormModule { }
