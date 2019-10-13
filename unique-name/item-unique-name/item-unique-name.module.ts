import { NgModule } from "@angular/core";
import { NgxsModule } from "@ngxs/store";

import { SharedDumbModule } from "@torrow/shared-dumb";
import { ContactUniqueNameModal } from "./contact-unique-name.modal";
import { ContactUniqueNameState } from "./contact-unique-name.state";
import { NoteUniqueNameModal } from "./note-unique-name.modal";
import { NoteUniqueNameState } from "./note-unique-name.state";

const DECLARATIONS = [
  ContactUniqueNameModal,
  NoteUniqueNameModal,
];

@NgModule({
  declarations: DECLARATIONS,
  entryComponents: DECLARATIONS,
  exports: DECLARATIONS,
  imports: [
    NgxsModule.forFeature([ContactUniqueNameState, NoteUniqueNameState]),
    SharedDumbModule,
  ],
})
export class ItemUniqueNameModule { }
