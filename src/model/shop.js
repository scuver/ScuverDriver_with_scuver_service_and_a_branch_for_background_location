import {Address} from './address';
export class Shop {
  constructor(
    uid = '',
    name = '',
    fiscalNumber = '',
    address = new Address(),
    phoneNumber = '',
    email = '',
    photoUrl = '',
    foodTypesId = [],
    suspendOrders = false,
    deliveryEnabled = true,
    onlinePaymentStatus = true,
    deliveryFee = 1.75,
    preparationTime = '00:30',
    deliveryCoverage = 7,
    minimumOrder = 5,
    businessType = 'shop',
    dinnerDisabled = false,
  ) {
    this.uid = uid;
    this.name = name;
    this.fiscalNumber = fiscalNumber;
    this.address = address;
    this.phoneNumber = phoneNumber;
    this.email = email;
    this.photoUrl = photoUrl;
    this.foodTypesId = foodTypesId;
    this.suspendOrders = suspendOrders;
    this.deliveryEnabled = deliveryEnabled;
    this.onlinePaymentStatus = onlinePaymentStatus;
    this.deliveryFee = deliveryFee;
    this.preparationTime = preparationTime;
    this.deliveryCoverage = deliveryCoverage;
    this.minimumOrder = minimumOrder;
    this.businessType = businessType;
    this.dinnerDisabled = dinnerDisabled;
  }
}
