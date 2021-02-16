import {User} from './user';
import {Shop} from './shop';
import {Driver} from './driver';
export class Order {
  constructor(
    uid = '',
    type = 'delivery',
    status = '',
    log = [],
    shop = new Shop(),
    user = new User(),
    driver = new Driver(),
    orderItems = [],
    address = null,
    submittedAt = '',
    completedAt = '',
    arrivalExpectedAt = '',
    subTotal = 0,
    total = 0,
    paid = false,
    paymentMethod = '',
    easypayPayment = {},
    easypayPaymentId = '',
    notes = '',
  ) {
    this.uid = uid;
    this.type = type;
    this.status = status;
    this.log = log;
    this.shop = shop;
    this.user = user;
    this.driver = driver;
    this.orderItems = orderItems;
    this.address = address;
    this.submittedAt = submittedAt;
    this.completedAt = completedAt;
    this.arrivalExpectedAt = arrivalExpectedAt;
    this.subTotal = subTotal;
    this.total = total;
    this.paid = paid;
    this.paymentMethod = paymentMethod;
    this.easypayPayment = easypayPayment;
    this.easypayPaymentId = easypayPaymentId;
    this.notes = notes;
  }
}
