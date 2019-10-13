import {
  Contact,
  IContactAddress,
  IContactField,
  IContactOrganization,
} from "@ionic-native/contacts/ngx";
import { WebView } from "@ionic-native/ionic-webview/ngx";

import {
  Address,
  Communication,
  CommunicationCheckState,
  CommunicationType,
  ContactClientItem,
  FileInfo,
  MemorableDate,
} from "@torrow/store-data";

// Workaround https://stackoverflow.com/questions/14023390/nsdate-return-1604-for-year-value
const DEFAULT_YEAR_IOS = 1604;

export class ContactImportMapper {
  public static transformToClient(contact: Contact, webview: WebView): ContactClientItem {
    const company: IContactOrganization | undefined = contact.organizations && contact.organizations[0];
    const communications = ContactImportMapper.getCommunications(contact);
    const addresses = ContactImportMapper.getAddresses(contact.addresses);
    const dates = ContactImportMapper.getDates(contact);

    const contactPhoto = contact.photos && contact.photos[0];
    const contactPhotoValue = contactPhoto && contactPhoto.value;
    const url = contactPhotoValue && webview.convertFileSrc(contactPhotoValue);
    const photo = url && new FileInfo({ url }) || undefined;

    const contactItem = new ContactClientItem({
      addresses,
      communications,
      company: company && company.name,
      dates,
      description: contact.note || undefined,
      firstName: contact.name.givenName || undefined,
      lastName: contact.name.familyName || undefined,
      middleName: contact.name.middleName || undefined,
      name: contact.displayName || undefined,
      photo,
      position: company && company.title,
    });

    return contactItem;
  }

  private static getAddresses(addressList: ReadonlyArray<IContactAddress>): Address[] {
    return (addressList || []).map((address: IContactAddress, index: number) => {

      const addressString = [
        address.postalCode,
        address.country,
        address.region,
        address.locality,
        address.streetAddress,
      ]
        .filter((value?: string): value is string => !!value)
        .join(" ");

      return new Address({
        addressName: address.type,
        addressString,
        order: index,
      });
    });
  }

  private static getDates(contact: Contact): MemorableDate[] {
    const birthday = contact && contact.birthday;
    const year = birthday instanceof Date && birthday.getFullYear();

    if (!year || year === DEFAULT_YEAR_IOS) {
      return [];
    }

    const memorableDate = new MemorableDate({
      date: birthday,
      name: "birthday",
      needsReminder: false,
      order: 0,
    });

    return [memorableDate];
  }

  private static getCommunications(contact: Contact): Communication[] {
    const phoneNumbers = ContactImportMapper.transformContactField(contact.phoneNumbers, CommunicationType.Phone);
    const emails = ContactImportMapper.transformContactField(contact.emails, CommunicationType.Email);
    const websites = ContactImportMapper.transformContactField(contact.urls, CommunicationType.WebSite);

    return [...phoneNumbers, ...emails, ...websites];
  }

  private static transformContactField(list: ReadonlyArray<IContactField>, type: CommunicationType): Communication[] {
    return (list || []).map((contactField: IContactField, index: number) =>
      new Communication({
        checkState: CommunicationCheckState.Unchecked,
        name: contactField.type,
        order: index,
        type,
        value: contactField.value,
        valueForSearch: contactField.value,
      }),
    );
  }
}
