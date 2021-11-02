import {BehaviorSubject, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {io} from 'socket.io-client';
window.navigator.userAgent = 'react-native';

const serviceUrl = 'http://89.115.211.74';
// const serviceUrl = 'http://localhost:65080';

exports.ScuverService = class ScuverService {
  socket = io(serviceUrl);

  observingCollections: Map<string, BehaviorSubject<any>> = new Map();
  observingRecords: Map<string, BehaviorSubject<any>> = new Map();
  observingQueries: Map<string, BehaviorSubject<any>> = new Map();

  constructor() {
    this.socket.connect();
    this.socket.on('connect', () => {
      console.log('connected to socket server');
    });
  }

  getCollection(collection: string): Promise<any> {
    return fetch(`${serviceUrl}/get/${collection}`, {
      headers: {Authorization: 'bolinhos'},
    }).then((response) => response.json());
  }

  getRecord(collection: string, uid: string): Promise<any> {
    return fetch(`${serviceUrl}/get/${collection}/${uid}`).then((response) =>
      response.json(),
    );
  }

  async getRecordByProperty(
    collection: string,
    property: string,
    filterOp: WhereFilterOp = '==',
    value: any,
  ) {
    return this.getRecordsByProperties(
      collection,
      [property],
      [filterOp],
      value ? [value] : [],
    ).then((r) => r[0]);
  }

  getRecordByProperties(
    collection: string,
    properties: string[],
    filterOp: WhereFilterOp | WhereFilterOp[] = '==',
    values: any[],
  ): Promise<any> {
    return this.getRecordsByProperties(
      collection,
      properties,
      filterOp,
      values,
    ).then((r) => r[0]);
  }

  getRecordsByProperty(
    collection: string,
    property: string,
    filterOp: WhereFilterOp = '==',
    value: any,
  ): Promise<any[]> {
    return this.getRecordsByProperties(
      collection,
      [property],
      [filterOp],
      value ? [value] : [],
    );
  }

  getRecordsByProperties(
    collection: string,
    properties: string[],
    filterOp: WhereFilterOp | WhereFilterOp[] = '==',
    values: any[],
  ): Promise<any> {
    console.log(
      'getRecordsByProperties',
      collection,
      properties,
      filterOp,
      values,
    );
    return fetch(
      `${serviceUrl}/getByProps?collection=${collection}&props=${encodeURI(
        JSON.stringify(properties),
      )}&operators=${encodeURI(JSON.stringify(filterOp))}&values=${encodeURI(
        JSON.stringify(values),
      )}`,
    ).then((response) => response.json());
  }

  addOrUpdateRecord(collection: string, record: any) {
    return fetch(`${serviceUrl}/addOrUpdate`, {
      method: 'POST',
      body: {collection, record},
    }).then((response) => response.json());
  }

  removeRecord(collection: string, uid: string) {
    return fetch(`${serviceUrl}/get/${collection}/${uid}`).then((response) =>
      response.json(),
    );
  }

  observeRecordByProperty(
    collection: string,
    property: string,
    filterOp: WhereFilterOp = '==',
    value: any,
  ): Observable<any> {
    return this.observeRecordsByProperties(
      collection,
      [property],
      [filterOp],
      value ? [value] : [],
    ).pipe(map((r) => r[0]));
  }

  observeRecordByProperties(
    collection: string,
    properties: string[],
    filterOp: WhereFilterOp | WhereFilterOp[] = '==',
    values: any[],
  ): Observable<any> {
    return this.observeRecordsByProperties(
      collection,
      properties,
      filterOp,
      values,
    ).pipe(map((r) => r[0]));
  }

  observeRecordsByProperty(
    collection: string,
    property: string,
    filterOp: WhereFilterOp = '==',
    value: any,
  ): Observable<any> {
    return this.observeRecordsByProperties(
      collection,
      [property],
      [filterOp],
      value ? [value] : [],
    );
  }

  observeRecordsByProperties(
    collection: string,
    properties: string[],
    filterOp: WhereFilterOp | WhereFilterOp[] = '==',
    values: any[],
  ): Observable<any> {
    console.log('observeRecordsByProperties arguments', arguments);
    const arrrgs = {
      collection,
      props: Array.isArray(properties) ? properties : [properties],
      operators: Array.isArray(filterOp) ? filterOp : [filterOp],
      values,
    };
    const query = JSON.stringify(arrrgs);
    if (!this.observingQueries.get(query)) {
      this.observingQueries.set(query, new BehaviorSubject());
      console.log('observeRecordsByProperties socket on', 'query:' + query);
      this.socket.on('query:' + query, (data) => {
        console.log('observeRecordsByProperties query from socket', data);
        this.observingQueries.get(query).next(data);
      });
      fetch(`${serviceUrl}/observeByProps`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: query,
      }).then((response) => response.json());
    }
    // @ts-ignore
    this.getRecordsByProperties(collection, properties, filterOp, values).then(
      (data) => {
        // console.log(
        //   'observeRecordsByProperties getRecordsByProperties data',
        //   data,
        // );
        this.observingQueries.get(query).next(data);
      },
    );
    return this.observingQueries.get(query);
  }

  observeCollection(collection: string): Observable<Array<any>> {
    console.log('observeCollection', collection);
    if (!this.observingCollections.get(collection)) {
      this.observingCollections.set(collection, new BehaviorSubject());
      this.socket.on(`update:${collection}`, (data) => {
        console.log('observeCollection on `update:${collection}`', data);
        this.observingCollections.get(collection).next(data);
      });
    }
    this.getCollection(collection).then((data) => {
      console.log('observeCollection getCollection', collection, data);
      this.observingCollections.get(collection).next(data);
    });
    return this.observingCollections.get(collection);
  }

  observeRecord(collection: string, uid: string): Observable<any> {
    if (!this.observingRecords.get(`${collection}:${uid}`)) {
      this.observingRecords.set(`${collection}:${uid}`, new BehaviorSubject());
      this.socket.on(`update:${collection}:${uid}`, (data) => {
        this.observingRecords.get(`${collection}:${uid}`).next(data);
      });
    }
    this.getRecord(collection, uid).then((data) => {
      console.log('observeRecord GET RECORD RESULT', data);
      this.observingRecords.get(`${collection}:${uid}`).next(data);
    });
    return this.observingRecords.get(`${collection}:${uid}`);
  }
};
