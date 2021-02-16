import {Item} from './item';
export class OrderItem extends Item {
  constructor(quantity = 0, optionsSelected = []) {
    super();
    this.quantity = quantity;
    this.optionsSelected = optionsSelected;
  }
}
