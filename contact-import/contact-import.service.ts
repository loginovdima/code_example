import { Injectable } from "@angular/core";
import {
  Contact,
  Contacts,
  IContactField,
} from "@ionic-native/contacts/ngx";
import { WebView } from "@ionic-native/ionic-webview/ngx";
import { TranslateService } from "@ngx-translate/core";

import {
  ContactClientItem,
  MemorableDate,
} from "@torrow/store-data";

import { PermissionsService } from "../native";
import { ContactImportMapper } from "./contact-import.mapper";

@Injectable({
  providedIn: "root",
})
export class ContactImportService {
  constructor(
    private readonly contacts: Contacts,
    private readonly permissionService: PermissionsService,
    private readonly translateService: TranslateService,
    private readonly webview: WebView,
  ) { }

  public async importContact(): Promise<ContactClientItem> {
    await this.permissionService.checkPermissions({ contactRead: true });
    const importedContact = await this.contacts.pickContact();
    const localizedImportedContact = this.localizeContactImport(importedContact);
    const contactItem = ContactImportMapper.transformToClient(localizedImportedContact, this.webview);

    return this.localizeContact(contactItem);
  }

  private localizeContactImport(contact: Contact): Contact {
    contact.phoneNumbers = this.localizeContactFieldList(contact.phoneNumbers);
    contact.emails = this.localizeContactFieldList(contact.emails);
    contact.urls = this.localizeContactFieldList(contact.urls);
    contact.addresses = this.localizeContactFieldList(contact.addresses);

    return contact;
  }

  private localizeContactFieldList(fieldList?: IContactField[]): IContactField[] {
    return (fieldList || []).map((field) => this.localizeContactField(field));
  }

  private localizeContactField(field: IContactField): IContactField {
    const type = this.getLocalizedCommunicationType(field.type);

    return { ...field, type };
  }

  private getLocalizedCommunicationType(type: string | undefined): string | undefined {
    switch (type) {
      case "main": {
        return this.translateService.instant("CONTACT_IMPORT.main");
      }
      case "profile": {
        return this.translateService.instant("CONTACT_IMPORT.profile");
      }
      case "work": {
        return this.translateService.instant("CONTACT_IMPORT.work");
      }
      case "mobile": {
        return this.translateService.instant("CONTACT_IMPORT.mobile");
      }
      case "other": {
        return this.translateService.instant("CONTACT_IMPORT.other");
      }
      case "home": {
        return this.translateService.instant("CONTACT_IMPORT.home");
      }
      case "home fax": {
        return this.translateService.instant("CONTACT_IMPORT.homeFax");
      }
      case "work fax": {
        return this.translateService.instant("CONTACT_IMPORT.workFax");
      }
      case "pager": {
        return this.translateService.instant("CONTACT_IMPORT.pager");
      }
      default: {
        return type;
      }
    }
  }

  private localizeContact(contactItem: ContactClientItem): ContactClientItem {
    contactItem.dates = this.localizeMemorableDateList(contactItem.dates);

    return contactItem;
  }

  private localizeMemorableDateList(memorableDateList?: MemorableDate[]): MemorableDate[] {
    return (memorableDateList || []).map((memorableDate) => this.localizeMemorableDate(memorableDate));
  }

  private localizeMemorableDate(memorableDate: MemorableDate): MemorableDate {
    const name = this.getLocalizedMemorableDateType(memorableDate.name);

    return new MemorableDate({
      ...memorableDate,
      name,
    });
  }

  private getLocalizedMemorableDateType(type: string | undefined): string | undefined {
    switch (type) {
      case "birthday": {
        return this.translateService.instant("CONTACT_IMPORT.birthday");
      }
      case "wedding": {
        return this.translateService.instant("CONTACT_IMPORT.wedding");
      }
      default: {
        return type;
      }
    }
  }
}
