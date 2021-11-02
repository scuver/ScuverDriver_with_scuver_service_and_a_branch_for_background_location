import React from 'react';
import {Button, Card, Paragraph, Text} from 'react-native-paper';
import {
  AppState,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {Order} from '../model/order';
import firestore from '@react-native-firebase/firestore';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';

const styles = StyleSheet.create({
  marker: {
    height: 5,
    width: 5,
  },
  container: {
    height: 400,
    width: 400,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  disclaimer: {
    fontSize: 20,
    marginTop: 15,
    marginBottom: 15,
    color: '#c21e1e',
  },
  scrollView: {
    textAlign: 'center',
    padding: '2%',
    height: '94%',
  },
  button: {
    marginLeft: 'auto',
    // position: 'absolute',
    // right: 0,
    // height: 300,
    // marginBottom: '5%',
  },
  buttonCopy: {
    height: 28,
  },
  buttonHistory: {
    marginLeft: 'auto',
    // marginTop: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
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

export default class MapScreen extends React.Component {
  ordersSubscription = null;

  constructor(props) {
    super(props);
    this.state = {
      order: null,
      latitude: 38.693334,
      longitude: -9.3304044,
      user: null,
    };
  }

  componentDidMount() {
    this.getCurrentUser();
  }

  componentWillUnmount() {
    this.ordersSubscription();
  }

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
          .onSnapshot((u) => {
            const fU = u.docs[0] && u.docs[0].data();
            console.log('fUfUfUfUfUfUUUUUUUUUUUUUUUUUUUUUU', fU);
            if (fU && fU.enabled) {
              this.setState(
                {
                  user: fU,
                  latitude: fU.latitude,
                  longitude: fU.longitude,
                },
                () => {
                  if (!this.ordersSubscription) {
                    this.subscribeOrders.bind(self)();
                  }
                },
              );
            }
          });
      } else {
        // Alert.alert('Info', 'Por favor efetue o login.', null, {
        //   cancelable: true,
        // });
        this.props.navigation.navigate('Login');
      }
    });
  }

  subscribeOrders() {
    this.ordersSubscription = firestore()
      .collection('orders')
      .where('type', '==', 'delivery')
      .where('status', '!=', 'completed')
      .where('driver.email', '==', this.state?.user?.email)
      .onSnapshot((results) => this.updateOrders(results));
  }

  updateOrders(results) {
    console.log('this.state.user.email', this.state.user.email);
    console.log('RESULTS', results);
    if (results && results.docs && results.docs.length) {
      console.log('results.docs.length', results.docs.length);
      console.log('results.docs[0]', results.docs[0]);
      console.log('results.docs[0].data()', results.docs[0].data());
      this.setState({
        order: results.docs[0].data(),
      });
    }
  }

  renderOrder(order: Order) {
    return (
      <Card key={order.uid} style={styles.card}>
        <Card.Content>
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
        </Card.Content>
      </Card>
    );
  }

  render() {
    return (
      <SafeAreaView>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}>
          <View style={styles.container}>
            {this.state && this.state.latitude ? (
              <MapView
                showsTraffic={true}
                provider={PROVIDER_GOOGLE} // remove if not using Google Maps
                style={styles.map}
                region={{
                  latitude: this.state.latitude,
                  longitude: this.state.longitude,
                  latitudeDelta: 0.015,
                  longitudeDelta: 0.0121,
                }}>
                <Marker
                  style={styles.marker}
                  image={{
                    uri:
                      'https://firebasestorage.googleapis.com/v0/b/scuver-data.appspot.com/o/clipart2240358.png?alt=media&token=0f77f87b-27f1-4f54-96d0-3a9b3958d8e5',
                  }}
                  coordinate={{
                    latitude: this.state.latitude,
                    longitude: this.state.longitude,
                  }}
                />
                {this.state && this.state.order ? (
                  <Marker
                    style={styles.marker}
                    pinColor={'#039790'}
                    coordinate={{
                      latitude: this.state.order.shop.address.coordinates
                        .latitude,
                      longitude: this.state.order.shop.address.coordinates
                        .longitude,
                    }}
                  />
                ) : null}
                {this.state && this.state.order ? (
                  <Marker
                    style={styles.marker}
                    pinColor={'#EB9F12'}
                    coordinate={{
                      latitude: this.state.order.address.coordinates.latitude,
                      longitude: this.state.order.address.coordinates.longitude,
                    }}
                  />
                ) : null}
                {/*37.102835, -122.252004*/}
              </MapView>
            ) : (
              <Text>Não é possível obter coordenadas.</Text>
            )}
          </View>
          <Paragraph style={styles.disclaimer}>
            <Text style={styles.disclaimer}>
              A recolher e armazenar coordenadas.{' '}
            </Text>
          </Paragraph>
          <Paragraph>
            <Text style={styles.value}> Lat: {this.state.latitude || 0} </Text>
            <Text style={styles.value}> Lng: {this.state.longitude || 0} </Text>
          </Paragraph>
          {this.state && this.state.order && this.renderOrder(this.state.order)}
        </ScrollView>
        <Button
          style={styles.buttonHistory}
          mode={'outlined'}
          onPress={() => this.props.navigation.navigate('Home')}>
          Entregas
        </Button>
      </SafeAreaView>
    );
  }
}
