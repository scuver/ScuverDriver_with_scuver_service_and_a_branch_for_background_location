import {Option} from './option';
export class OrderOption extends Option {
  constructor(quantity = 0) {
    super();
    this.quantity = quantity;
  }
}
