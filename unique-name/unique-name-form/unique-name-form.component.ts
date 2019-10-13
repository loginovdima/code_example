import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from "@angular/core";
import {
  AbstractControl,
  FormGroupDirective,
} from "@angular/forms";
import { Subscription } from "rxjs";

import { UNIQUE_NAME_PREFIX } from "@torrow/config";
import {
  HttpErrorNamesEnum,
  TorrowItem,
} from "@torrow/store-data";
import { TorrowError } from "@torrow/utils";

import { UniqueNameFormGroup } from "./unique-name-form-group.model";
import { UniqueNameFormSubmitValue } from "./unique-name-form-submit-value.model";
import { UniqueNameFormValue } from "./unique-name-form-value.model";
import { UniqueNameFormService } from "./unique-name-form.service";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: "tt-unique-name-form",
  styleUrls: ["./unique-name-form.component.scss"],
  templateUrl: "./unique-name-form.component.html",
})
export class UniqueNameFormComponent<T extends TorrowItem> implements AfterViewInit, OnDestroy {
  public readonly form = new UniqueNameFormGroup();

  public readonly uniqueNamePrefix = UNIQUE_NAME_PREFIX;

  public readonly maxLengthUniqueName = UniqueNameFormGroup.maxLengthUniqueName;
  public readonly minLengthUniqueName = UniqueNameFormGroup.minLengthUniqueName;

  public readonly i18nDescription = "UNIQUE_NAME_FORM.description";
  public readonly i18nUniqueName = "UNIQUE_NAME_FORM.uniqueName";
  public readonly i18nValidateCharacters = "UNIQUE_NAME_FORM.validateCharacters";
  public readonly i18nValidateMinLength = "UNIQUE_NAME_FORM.validateMinLength";
  public readonly i18nValidateMessage = "UNIQUE_NAME_FORM.validateMessage";
  public readonly i18nValidateUnique = "UNIQUE_NAME_FORM.validateUnique";

  @Input()
  public error?: TorrowError;

  @Output()
  public readonly formSubmit = new EventEmitter<UniqueNameFormSubmitValue<T>>();

  @ViewChild(FormGroupDirective, { static: false })
  private readonly formGroupDirective!: FormGroupDirective;

  private _item?: T;

  private readonly subscription: Subscription;

  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly uniqueNameFormService: UniqueNameFormService<T>,
  ) {
    this.subscription = new Subscription();
  }

  public get controlUniqueName(): AbstractControl | null {
    return this.form.get("uniqueName" as keyof UniqueNameFormValue);
  }

  public get errorName(): string | undefined {
    return this.error && this.error.name;
  }

  public get isBusyUniqueName(): boolean {
    return this.errorName === HttpErrorNamesEnum.UniqueNameIsAlreadyBusy || false;
  }

  public get isBusyUniqueNameVisible(): boolean {
    return this.isBusyUniqueName && this.form.pristine || false;
  }

  public get inputValue(): string {
    return this.formValue && this.formValue.uniqueName || "";
  }

  public get stateChanged(): boolean {
    return this.form.stateChanged;
  }

  @Input()
  public set item(value: T) {
    const formValue = this.uniqueNameFormService.buildFormValue(value);
    this.form.patchValue(formValue);

    this._item = value;
  }

  private get formValue(): UniqueNameFormValue {
    return this.form.value;
  }

  public get showDeleteIcon(): boolean {
    return this.formValue.uniqueName.length > 0;
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public ngAfterViewInit(): void {
    this.subscription.add(this.effectOnSubmit());
  }

  public clearInputValue(): void {
    this.form.markAsDirty();
    this.form.markAsTouched();
    this.form.setValue({ uniqueName: "" });
  }

  public onSubmitForm(): void {
    if (!this._item || !this.form.valid) {
      return;
    }

    const updatedItem = this.uniqueNameFormService.buildModel(
      this.formValue,
      this._item,
    );

    this.resetFormGroup();

    const submitValue: UniqueNameFormSubmitValue<T> = {
      item: updatedItem,
    };

    this.formSubmit.emit(submitValue);
  }

  private resetFormGroup(): void {
    const formValue = this.formValue;

    this.formGroupDirective.resetForm(formValue);
  }

  private effectOnSubmit(): Subscription {
    return this.formGroupDirective.ngSubmit
      .subscribe(() => {
        this.error = undefined;

        this.changeDetectorRef.markForCheck();
      });
  }
}
