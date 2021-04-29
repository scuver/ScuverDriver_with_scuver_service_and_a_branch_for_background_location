export class Driver {
  constructor(
    uid = '',
    name = '',
    email = '',
    fiscalNumber = '',
    phoneNumber = '',
    tpa = false,
    bag = false,
    enabled = true,
    area = '',
    fcmTokens = [],
    isSuper = false,
  ) {
    this.uid = uid;
    this.name = name;
    this.email = email;
    this.fiscalNumber = fiscalNumber;
    this.phoneNumber = phoneNumber;
    this.tpa = tpa;
    this.bag = bag;
    this.enabled = enabled;
    this.area = area;
    this.fcmTokens = fcmTokens;
    this.isSuper = isSuper;
  }
}
