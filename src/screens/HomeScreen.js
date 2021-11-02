import React, {Fragment} from 'react';
import {Button, Card, Paragraph, Text} from 'react-native-paper';
import {
  Alert,
  AppState,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {Order} from '../model/order';
import {showLocation} from 'react-native-map-link';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';
import Clipboard from '@react-native-community/clipboard';
import NotificationSound from '../NotificationSound';
import BackgroundGeolocation from 'react-native-background-geolocation';

const styles = StyleSheet.create({
  scrollView: {
    textAlign: 'center',
    padding: '2%',
    height: '86%',
  },
  disclaimer: {
    paddingLeft: 20,
    fontSize: 20,
    // marginTop: 15,
    // marginBottom: 15,
    color: '#c21e1e',
  },
  bottomP: {
    // margin: '5%',
    height: 50,
    alignContent: 'space-between',
    textAlignVertical: 'bottom',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  underBottomP: {
    marginRight: 20,
  },
  button: {
    marginLeft: 'auto',
  },
  buttonCopy: {
    height: 28,
  },
  card: {
    margin: '1%',
  },
  label: {
    fontWeight: 'bold',
  },
  value: {},
  stateDisabled: {
    color: '#919090',
  },
  stateEnabled: {
    color: '#6dbc28',
  },
  link: {
    color: '#50959d',
  },
  privacy: {
    color: '#50959d',
    fontSize: 25,
    textDecorationLine: 'underline',
  },
  para: {
    marginBottom: '2%',
  },
  atm: {
    fontSize: 20,
    color: '#c83333',
  },
  paid: {
    fontSize: 20,
    color: '#6dbc28',
  },
});

const states = {
  pending: 'Pendente',
  viewed: 'Em Preparação',
  ready: 'Pronta para Entrega',
  bringing: 'A Entregar',
};

export default class HomeScreen extends React.Component {
  ordersSubscription = null;

  constructor(props) {
    super(props);
    this.state = {
      orders: [],
      user: null,
      latitude: 0,
      longitude: 0,
      hasOrder: false,
      isTracking: false,
      appState: AppState.currentState,
    };
  }

  componentDidMount() {
    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      this.getCurrentUser();
    });
    this.getCurrentUser();
    AsyncStorage.getItem('visited').then((visited) => {
      if (!visited) {
        AsyncStorage.setItem('visited', 'true').then(() => {
          this.forceUpdate();
        });
      }
    });
    AppState.addEventListener('change', this._handleAppStateChange);
  }

  componentWillUnmount() {
    this._unsubscribe();
    AppState.removeEventListener('change', this._handleAppStateChange);
    if (this.ordersSubscription) {
      this.ordersSubscription();
    }
    NotificationSound.stop();
  }

  _handleAppStateChange = (nextAppState) => {
    console.log('nextAppState', nextAppState);
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      console.log('App came to foreground. Updating orders.');

      firestore()
        .collection('orders')
        .where('type', '==', 'delivery')
        .where('status', 'in', ['pending', 'viewed', 'ready', 'bringing'])
        // .where('status', 'in', ['pending'])
        .get({source: 'server'})
        .then((results) => this.updateOrders(results));
    }
    this.setState({appState: nextAppState});
  };

  getCurrentUser() {
    const self = this;
    AsyncStorage.getItem('user').then((u: any) => {
      console.log('u from local storage', u);
      const authUser = u && JSON.parse(u).user;
      if (authUser) {
        console.log('authUser.email', authUser.email);
        const dbRef = firestore().collection('drivers');
        dbRef
          .where('email', '==', authUser.email.toLowerCase().trim())
          .get({source: 'server'})
          .then((u) => {
            const fU = u.docs[0] && u.docs[0].data();
            if (fU && fU.enabled) {
              this.setState(
                {
                  user: fU,
                },
                () => {
                  this.initMessaging.bind(self)();
                  this.subscribeOrders.bind(self)();
                  AsyncStorage.setItem('user_email', fU.email);
                  if (fU.isSuper) {
                    AsyncStorage.setItem('user_is_super', 'true');
                  } else {
                    AsyncStorage.removeItem('user_is_super');
                  }
                },
              );
            }
          });
      } else {
        this.props.navigation.navigate('Login');
      }
    });
  }

  startLocating() {
    const self = this;

    // This handler fires whenever bgGeo receives a location update.
    BackgroundGeolocation.onLocation(this.onLocation.bind(self), self.onError);

    BackgroundGeolocation.onProviderChange((event) => {
      console.log('[onProviderChange: ', event);

      switch (event.status) {
        case BackgroundGeolocation.AUTHORIZATION_STATUS_DENIED:
          // Android & iOS
          console.log('- Location authorization denied');
          break;
        case BackgroundGeolocation.AUTHORIZATION_STATUS_ALWAYS:
          // Android & iOS
          console.log('- Location always granted');
          break;
        case BackgroundGeolocation.AUTHORIZATION_STATUS_WHEN_IN_USE:
          // iOS only
          console.log('- Location WhenInUse granted');
          break;
      }
    });

    BackgroundGeolocation.ready(
      {
        // Geolocation Config
        desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_NAVIGATION,
        distanceFilter: 10,
        // Activity Recognition
        stopTimeout: 1,
        // Application config
        debug: false, // <-- enable this hear sounds for background-geolocation life-cycle.
        logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
        stopOnTerminate: true, // <-- Allow the background-service to continue tracking when user closes the app.
        startOnBoot: false, // <-- Auto start tracking when device is powered-up.
      },
      (state) => {
        console.log(
          'LOCATION - BackgroundGeolocation is configured and ready: ',
          self.state.isTracking,
        );

        if (!self.state.isTracking) {
          BackgroundGeolocation.start(function () {
            self.setState({
              isTracking: true,
            });
            console.log('- Start success');
          });
        }
      },
    );
  }

  onLocation(location) {
    console.log(
      'ON LOCATION this.isTracking',
      this.state.isTracking,
      this.state.user,
      location,
    );
    if (location && this.state && this.state.user) {
      this.setState(
        {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        () => {
          firestore().collection('drivers').doc(this.state.user.uid).update({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        },
      );
    }
    if (!this.state.hasOrder && this.state.isTracking) {
      BackgroundGeolocation.removeListeners();
      this.setState({
        isTracking: false,
      });
    }
  }
  onError(error) {
    console.warn('[location] ERROR -', error);
  }

  initMessaging() {
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Message handled in the background!');
    });
    AsyncStorage.getItem('fcm_driver_token').then((u: any) => {
      console.log('u', u);
      if (!u) {
        console.log('Getting Firebase Token');
        messaging()
          .getToken()
          .then((fcmToken) => {
            if (fcmToken) {
              console.log('Your Firebase Token is:', fcmToken);
              AsyncStorage.setItem('fcm_driver_token', fcmToken);
              let tks = this.state.user.fcmTokens;
              if (!tks) {
                tks = [];
              }
              tks.push(fcmToken);
              firestore()
                .collection('drivers')
                .doc(this.state.user.uid)
                .update({
                  fcmTokens: tks,
                });
            } else {
              console.log('Failed', 'No token received');
            }
          });
      }
    });
  }

  openMap(lat, lng) {
    showLocation({
      latitude: lat,
      longitude: lng,
    }).then();
  }

  openGoogleMaps(a) {
    let address = a.addressLine1;
    address += ' ';
    address += a.addressLine2 || '';
    address += ' ';
    address += a.postCode || '';
    address += ' ';
    address += a.local || '';
    address = encodeURI(address);
    Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${address}`,
    );
  }

  subscribeOrders() {
    this.ordersSubscription = firestore()
      .collection('orders')
      .where('type', '==', 'delivery')
      .where('status', 'in', ['pending', 'viewed', 'ready', 'bringing'])
      // .where('status', 'in', ['pending'])
      .onSnapshot((results) => this.updateOrders(results));
  }

  updateOrders(results) {
    const self = this;

    const renderedOrders = [];
    const orders = [];
    results.forEach((r) => {
      const o = r.data();
      if (this.state.user.isSuper || o.status !== 'pending') {
        orders.push(o);
      }
    });
    const driverHasOrder = !!orders.find(
      (o) => o.driver?.email === this.state.user.email,
    );

    orders.forEach((order: Order) => {
      if (
        (!order.shop.specificDrivers ||
          order.shop.specificDrivers.find(
            (d) => d === this.state.user.email,
          )) &&
        (order.driver?.email === this.state.user.email ||
          (!order.driver && !driverHasOrder) ||
          (!order.driver && this.state.user.isSuper))
      ) {
        renderedOrders.push(this.renderOrder(order));
      }
    });
    this.setState({orders: renderedOrders, hasOrder: driverHasOrder});
    console.log(
      'LOCATION hasOrder isTracking',
      driverHasOrder,
      this.state.isTracking,
    );
    if (driverHasOrder && !this.state.isTracking) {
      this.startLocating.bind(self)();
    }
  }

  copyToClipboard = (text) => {
    Clipboard.setString(text);
  };

  renderOrder(order: Order) {
    return (
      <Card key={order.uid} style={styles.card}>
        <Card.Content>
          <Paragraph>
            <Text style={styles.label}>Estado: </Text>
            <Text
              style={
                order.status === 'ready' || order.status === 'sent'
                  ? styles.stateEnabled
                  : styles.stateDisabled
              }>
              {states[order.status || 'viewed']}
            </Text>
          </Paragraph>
          <Paragraph>
            <Text style={styles.label}>Hora de Entrega (no cliente): </Text>
            <Text style={styles.value}>{order.arrivalExpectedAt}</Text>
          </Paragraph>
          <Paragraph>
            <Text style={styles.label}>Referência: </Text>
            <Text style={styles.value}>
              {order.uid?.substring(order.uid.length - 4)}
            </Text>
          </Paragraph>
          <Paragraph>
            <Text style={styles.label}>Estabelecimento: </Text>
            <Text style={styles.value}>{order.shop.name}</Text>
          </Paragraph>
          <Paragraph style={styles.para}>
            <Text style={styles.label}>Morada Estabelecimento: </Text>
            {'\n'}
            <Text
              style={order.shop.address ? styles.link : null}
              onPress={() => this.openGoogleMaps(order.shop.address)}>
              {(order.shop.address.addressLine1 || '') + ' '}
              {(order.shop.address.addressLine2 || '') + ' '}
              {(order.shop.address.postCode || '') + ' '}
              {order.shop.address.local || ''}
            </Text>
          </Paragraph>
          <Paragraph style={styles.para}>
            <Button
              style={styles.buttonCopy}
              mode={'clear'}
              onPress={() =>
                this.copyToClipboard(
                  (order.shop.address.addressLine1 || '') +
                    ' ' +
                    (order.shop.address.addressLine2 || '') +
                    ' ' +
                    (order.shop.address.postCode || '') +
                    ' ' +
                    order.shop.address.local || '',
                )
              }>
              Copiar
            </Button>
          </Paragraph>
          <Paragraph style={styles.para}>
            <Text style={styles.label}>Coordenadas Estabelecimento: </Text>
            {'\n'}
            <Text
              style={order.shop.address ? styles.link : null}
              onPress={() =>
                this.openMap(
                  order.shop.address.coordinates.latitude,
                  order.shop.address.coordinates.longitude,
                )
              }>
              {order.shop.address.coordinates.latitude},
              {order.shop.address.coordinates.longitude}
            </Text>
          </Paragraph>
          <Paragraph style={styles.para}>
            <Button
              style={styles.buttonCopy}
              mode={'clear'}
              onPress={() =>
                this.copyToClipboard(
                  order.shop.address.coordinates.latitude +
                    ',' +
                    order.shop.address.coordinates.longitude,
                )
              }>
              Copiar
            </Button>
          </Paragraph>
          {!!order.driver && (
            <>
              <Paragraph>
                <Text style={styles.label}>Cliente: </Text>
                <Text style={styles.value}>{order.user.name}</Text>
              </Paragraph>
              <Paragraph>
                <Text style={styles.label}>Telefone: </Text>
                <Text
                  style={styles.link}
                  onPress={() =>
                    Linking.openURL(`tel:${order.user.phoneNumber}`)
                  }>
                  {order.user.phoneNumber}
                </Text>
              </Paragraph>
              <Paragraph style={styles.para}>
                <Text style={styles.label}>Morada Cliente: </Text>
                {'\n'}
                <Text
                  style={order.address ? styles.link : null}
                  onPress={() => this.openGoogleMaps(order.address)}>
                  {(order.address.addressLine1 || '') + ' '}
                  {(order.address.addressLine2 || '') + ' '}
                  {(order.address.postCode || '') + ' '}
                  {order.address.local || ''}
                </Text>
              </Paragraph>
              <Paragraph style={styles.para}>
                <Button
                  style={styles.buttonCopy}
                  mode={'clear'}
                  onPress={() =>
                    this.copyToClipboard(
                      (order.address.addressLine1 || '') +
                        ' ' +
                        (order.address.addressLine2 || '') +
                        ' ' +
                        (order.address.postCode || '') +
                        ' ' +
                        order.address.local || '',
                    )
                  }>
                  Copiar
                </Button>
              </Paragraph>
              <Paragraph style={styles.para}>
                <Text style={styles.label}>Coordenadas Cliente: </Text>
                {'\n'}
                <Text
                  style={order.address ? styles.link : null}
                  onPress={() =>
                    this.openMap(
                      order.address.coordinates.latitude,
                      order.address.coordinates.longitude,
                    )
                  }>
                  {order.address.coordinates.latitude},
                  {order.address.coordinates.longitude}
                </Text>
              </Paragraph>
              <Paragraph style={styles.para}>
                <Button
                  style={styles.buttonCopy}
                  mode={'clear'}
                  onPress={() =>
                    this.copyToClipboard(
                      order.address.coordinates.latitude +
                        ',' +
                        order.address.coordinates.longitude,
                    )
                  }>
                  Copiar
                </Button>
              </Paragraph>
              <Paragraph>
                <Text style={styles.label}>Notas: </Text>
                <Text style={styles.value}>{order.notes}</Text>
              </Paragraph>
              <Paragraph>
                <Text style={styles.label}>Artigos: </Text>
                <Text style={styles.value}>
                  {order.orderItems.map(
                    (o) => o.quantity + ' ' + o.name + '\n',
                  )}
                </Text>
              </Paragraph>
              <Paragraph>
                <Text style={styles.label}>Total: </Text>
                <Text style={styles.value}>{this.calculateCost(order)}</Text>
              </Paragraph>
            </>
          )}
          <Paragraph>
            <Text style={styles.label}>Estado Pagamento: </Text>
            <Text
              style={
                order.paymentMethod === 'payment-on-delivery'
                  ? styles.atm
                  : styles.paid
              }>
              {order.paymentMethod === 'payment-on-delivery' ? 'TPA' : 'PAGO'}
            </Text>
          </Paragraph>
        </Card.Content>
        <Card.Actions>
          {((order.status === 'pending' && this.state.user.isSuper) ||
            order.status === 'viewed' ||
            order.status === 'ready') &&
            !order.driver && (
              <Button
                style={styles.button}
                mode={'contained'}
                onPress={() => this.accept(order)}>
                Aceitar
              </Button>
            )}
          {order.driver?.email === this.state.user.email &&
            order.status !== 'bringing' && (
              <Button
                style={styles.button}
                mode={'contained'}
                onPress={() => this.bringing(order)}>
                Encomenda Recolhida
              </Button>
            )}
          {order.driver?.email === this.state.user.email &&
            order.status === 'bringing' && (
              <Button
                style={styles.button}
                mode={'contained'}
                onPress={() => this.complete(order)}>
                Entrega Concluída
              </Button>
            )}
        </Card.Actions>
      </Card>
    );
  }

  accept(order: Order) {
    if (
      order.status === 'pending' ||
      order.status === 'viewed' ||
      order.status === 'ready'
    ) {
      if (
        order.paymentMethod !== 'payment-on-delivery' ||
        (order.paymentMethod === 'payment-on-delivery' && this.state.user.tpa)
      ) {
        Alert.alert(
          'Aceitar Encomenda',
          'Tem a certeza que quer aceitar esta encomenda? IMPORTANTE: Após aceitar a encomenda iremos monitorizar a sua localização em segundo-plano.',
          [
            {
              text: 'Não',
              onPress: () => console.log('Encomenda não aceite.'),
              style: 'cancel',
            },
            {
              text: 'Sim',
              onPress: () => {
                fetch(
                  'https://europe-west1-scuver-data.cloudfunctions.net/driverAcceptOrder',
                  {
                    method: 'post',
                    body: JSON.stringify({
                      driverUID: this.state.user.uid,
                      orderUID: order.uid,
                    }),
                  },
                )
                  .then((response) => {
                    console.log('response', response);
                    if (response.ok) {
                      this.setState({
                        deliveringOrder: order,
                      });
                    } else {
                      Alert.alert('Info', 'Entrega já não está disponível.');
                    }
                  })
                  .catch((err) => console.error('ERROR', err));
              },
            },
          ],
          {cancelable: false},
        );
      } else {
        Alert.alert(
          'Info',
          'Esta encomenda necessita TPA. Só estafetas com o terminal multibanco poderão aceitar.',
        );
      }
    } else {
      Alert.alert('Info', 'Entrega já não está disponível.');
    }
  }

  bringing(order: Order) {
    let message = 'Confirma que recolheu a encomenda?';
    Alert.alert(
      'Completar Encomenda',
      message,
      [
        {
          text: 'Não',
          onPress: () => console.log('Encomenda não entregue.'),
          style: 'cancel',
        },
        {
          text: 'Sim',
          onPress: () => {
            const log = order.log;
            order.log.push('Bringing at ' + new Date());
            order.status = 'bringing';
            firestore().collection('orders').doc(order.uid).update({
              log: order.log,
              status: 'bringing',
            });
            this.setState({
              deliveringOrder: null,
            });
          },
        },
      ],
      {cancelable: false},
    );
  }

  complete(order: Order) {
    let message = 'Confirma que entregou a encomenda?';
    if (order.paymentMethod === 'payment-on-delivery') {
      message +=
        '\n\nEsta encomenda deve ser cobrada por cartão multibanco ou no caso de não ter TPA deve informar o cliente que entraremos em contacto mais tarde.';
    }
    Alert.alert(
      'Completar Encomenda',
      message,
      [
        {
          text: 'Não',
          onPress: () => console.log('Encomenda não entregue.'),
          style: 'cancel',
        },
        {
          text: 'Sim',
          onPress: () => {
            const log = order.log;
            order.log.push('Delivered at ' + new Date());
            order.status = 'completed';
            firestore().collection('orders').doc(order.uid).update({
              log: order.log,
              status: order.status,
            });
            this.setState({
              deliveringOrder: null,
            });
          },
        },
      ],
      {cancelable: false},
    );
  }

  calculateCost(order) {
    let cost =
      order.total ||
      order.subTotal +
        (order.deliveryFee === 0
          ? 0
          : order.deliveryFee
          ? order.deliveryFee
          : 1.75);
    return cost;
  }

  render() {
    return (
      <SafeAreaView>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}>
          {this.state && (
            <>
              <Paragraph>
                <Text style={styles.label}>Entregas: </Text>
                <Text style={styles.value}>
                  {this.state.orders?.length || 0}
                </Text>
              </Paragraph>
            </>
          )}
          {this.state && this.state.orders}
        </ScrollView>
        {/*<Paragraph>*/}
        {/*  <Text style={styles.value}> Lat: {this.state.latitude || 0} </Text>*/}
        {/*  <Text style={styles.value}> Lng: {this.state.longitude || 0} </Text>*/}
        {/*</Paragraph>*/}
        {this.state && this.state.isTracking ? (
          <Paragraph style={styles.disclaimer}>
            <Text style={styles.disclaimer}>
              A recolher e armazenar coordenadas.{' '}
            </Text>
          </Paragraph>
        ) : (
          <Text> </Text>
        )}
        <Paragraph>
          <Text style={styles.value}> Lat: {this.state.latitude || 0} </Text>
          <Text style={styles.value}> Lng: {this.state.longitude || 0} </Text>
        </Paragraph>
        <Paragraph style={styles.bottomP}>
          <Paragraph>
            <Button
              style={styles.buttonHistory}
              mode={'outlined'}
              onPress={() => this.props.navigation.navigate('History')}>
              Histórico
            </Button>
            {this.state && this.state.isTracking ? (
              <Button
                style={styles.buttonHistory}
                mode={'outlined'}
                onPress={() => this.props.navigation.navigate('Map')}>
                Mapa
              </Button>
            ) : (
              <Text> </Text>
            )}
            <Text
              style={styles.privacy}
              onPress={() =>
                Linking.openURL(
                  'https://app-scuver.web.app/privacy-policy.html',
                )
              }>
              Privacidade
            </Text>
          </Paragraph>
        </Paragraph>
      </SafeAreaView>
    );
  }
}
