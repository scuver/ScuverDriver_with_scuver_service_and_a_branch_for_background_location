export class Item {
  constructor(
    uid = '',
    name = '',
    description = '',
    tax = 0,
    price = 0,
    available = true,
    photoUrl = '',
    isWeightBased = false,
    minWeight = 1,
    maxWeight = 5,
    optionGroupsId = [],
  ) {
    this.uid = uid;
    this.name = name;
    this.description = description;
    this.tax = tax;
    this.price = price;
    this.available = available;
    this.photoUrl = photoUrl;
    this.isWeightBased = isWeightBased;
    this.minWeight = minWeight;
    this.maxWeight = maxWeight;
    this.optionGroupsId = optionGroupsId;
  }
}
