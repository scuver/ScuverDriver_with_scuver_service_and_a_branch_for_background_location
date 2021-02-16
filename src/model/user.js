export class User {
  constructor(
    uid = '',
    name = '',
    email = '',
    fiscalNumber = '',
    role = 'client',
    phoneNumber = '',
    addresses = [],
    photoUrl = '',
    shopId = '',
    authProvider = 'password',
  ) {
    this.uid = uid;
    this.name = name;
    this.email = email;
    this.fiscalNumber = fiscalNumber;
    this.role = role;
    this.phoneNumber = phoneNumber;
    this.addresses = addresses;
    this.photoUrl = photoUrl;
    this.shopId = shopId;
    this.authProvider = authProvider;
  }
}
