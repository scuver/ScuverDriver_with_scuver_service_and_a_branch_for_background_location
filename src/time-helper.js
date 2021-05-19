export class TimeHelper {
  /**
   * Parses and returns an object containg the hour and minute.
   * @param time - A string containing the time with the format "22:30"
   * @returns An object as: { hour, minute }.
   */
  static parse(time: string): MyTime {
    const hour = Number(time.split(':')[0]);
    const minute = Number(time.split(':')[1]);
    return new MyTime(hour, minute);
  }

  static minutes(time: string) {
    const timeObj = this.parse(time);
    return timeObj.hour * 60 + timeObj.minute;
  }

  static minutesToTime(timeInMinutes: number) {
    const hour = Math.floor(timeInMinutes / 60);
    const minutes = timeInMinutes % 60;
    return new MyTime(hour, minutes);
  }

  static timeToMinutes(time: MyTime) {
    return time.hour * 60 + time.minute;
  }

  static getCurrentDay() {
    const today = new Date();
    const days = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    return days[today.getDay()];
  }

  static getCurrentTime() {
    const today = new Date();
    const time = today.getHours() + ':' + today.getMinutes();
    return this.parse(time);
  }

  static getCurrentDateFormatted() {
    const today = new Date();
    const date =
      today.getFullYear() +
      '-' +
      (today.getMonth() + 1) +
      '-' +
      today.getDate();
    const time =
      today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
    const dateTime = date + ' ' + time;

    return dateTime;
  }

  static isWithinTimeSpan(time: MyTime, from: MyTime, to: MyTime) {
    const timeInMinutes = time.hour * 60 + time.minute;
    const fromInMinutes = from.hour * 60 + from.minute;
    const toInMinutes = to.hour * 60 + (to.minute - 1);

    if (timeInMinutes < fromInMinutes) {
      return false;
    }
    if (timeInMinutes > toInMinutes) {
      return false;
    }

    return true;
  }
}

export class MyTime {
  constructor(hour: number, minute: number) {}

  static getCurrentTime(): MyTime {
    const today = new Date();
    return new MyTime(today.getHours(), today.getMinutes());
  }

  static parse(time: string): MyTime {
    const hour = Number(time.split(':')[0]);
    const minute = Number(time.split(':')[1]);
    return new MyTime(hour, minute);
  }

  static minutesToTime(timeInMinutes: number) {
    const hour = Math.floor(timeInMinutes / 60);
    const minutes = timeInMinutes % 60;
    return new MyTime(hour, minutes);
  }

  toString() {
    const hour = this.hour > 9 ? '' + this.hour : '0' + this.hour;
    const minute = this.minute > 9 ? '' + this.minute : '0' + this.minute;
    return `${hour}:${minute}`;
  }

  minutesFromNow() {
    const currentTimeInMinutes = TimeHelper.getCurrentTime().toMinutes();
    const timeInMinutes = this.toMinutes();
    return currentTimeInMinutes - timeInMinutes;
  }

  toMinutes() {
    return this.hour * 60 + this.minute;
  }

  addMinutes(minutes: number) {
    const totalTime = MyTime.minutesToTime(this.toMinutes() + minutes);
    this.hour = totalTime.hour;
    this.minute = totalTime.minute;
  }

  subtractMinutes(minutes: number) {
    const totalTime = MyTime.minutesToTime(this.toMinutes() - +minutes);
    this.hour = totalTime.hour;
    this.minute = totalTime.minute;
  }

  copy() {
    return new MyTime(this.hour, this.minute);
  }

  equals(otherTime: MyTime) {
    if (!otherTime) {
      return false;
    }

    const time1 = this.toMinutes();
    const time2 = otherTime.toMinutes();
    return time1 === time2;
  }

  isWithinTimeSpan(from: MyTime, to: MyTime) {
    const timeInMinutes = this.hour * 60 + this.minute;
    const fromInMinutes = from.hour * 60 + from.minute;
    const toInMinutes = to.hour * 60 + (to.minute - 1);

    if (timeInMinutes < fromInMinutes) {
      return false;
    }
    if (timeInMinutes > toInMinutes) {
      return false;
    }

    return true;
  }
}

export class MyDate {
  constructor(day: number, month: number, year: number) {}

  static getCurrentDate() {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    return new MyDate(day, month, year);
  }

  static getCurrentDay() {
    const today = new Date();
    const days = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    return days[today.getDay()];
  }

  static getNextDay() {
    const today = new Date();
    const days = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    return days[today.getDay() + 1] || days[0];
  }

  static parse(time: string): MyDate {
    const month = Number(time.split('-')[0]);
    const day = Number(time.split('-')[1]);
    const year = Number(time.split('-')[2]);
    return new MyDate(day, month, year);
  }

  toMinutes() {
    return this.day * 1440 + this.month * 43800 + this.year * 525600;
  }

  toString() {
    const day = this.day > 9 ? '' + this.day : '0' + this.day;
    const month = this.month > 9 ? '' + this.month : '0' + this.month;
    const year = this.year;

    return `${month}-${day}-${year}`;
  }
}

export class MyMoment {
  constructor(date: MyDate, time: MyTime) {}

  static getCurrentMoment() {
    const date = MyDate.getCurrentDate();
    const time = MyTime.getCurrentTime();
    return new MyMoment(date, time);
  }

  static parse(moment: string): MyMoment {
    const date = MyDate.parse(moment.split(' ')[0]);
    const time = MyTime.parse(moment.split(' ')[1]);
    return new MyMoment(date, time);
  }

  static todayAt(time: MyTime): MyMoment {
    const moment = this.getCurrentMoment();
    moment.time = time;
    return moment;
  }

  toMinutes() {
    return this.date.toMinutes() + this.time.toMinutes();
  }

  toString() {
    return `${this.date.toString()} ${this.time.toString()}`;
  }
}
