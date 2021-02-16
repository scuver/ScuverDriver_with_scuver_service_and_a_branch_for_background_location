export class Address {
  constructor(
    addressLine1 = '',
    addressLine2 = '',
    local = '',
    postCode = '',
    coordinates = {latitude: 0, longitude: 0},
  ) {
    this.addressLine1 = addressLine1;
    this.addressLine2 = addressLine2;
    this.local = local;
    this.postCode = postCode;
    this.coordinates = coordinates;
  }
}
