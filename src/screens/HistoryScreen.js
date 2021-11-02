import React from 'react';
import {Button, Card, Paragraph, Text} from 'react-native-paper';
import {AppState, SafeAreaView, ScrollView, StyleSheet} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {Order} from '../model/order';
import {ScuverService} from '../scuver.service';

const styles = StyleSheet.create({
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

export default class HistoryScreen extends React.Component {
  ordersSubscription = null;
  service = new ScuverService();

  constructor(props) {
    super(props);
    this.state = {
      orders: [],
      user: null,
    };
  }

  componentDidMount() {
    this.getCurrentUser();
  }

  componentWillUnmount() {
    try {
      this.ordersSubscription();
    } catch (e) {}
  }

  getCurrentUser() {
    const self = this;
    AsyncStorage.getItem('user').then((u: any) => {
      console.log('u from local storage', u);
      const authUser = u && JSON.parse(u).user;
      if (authUser) {
        console.log('authUser.email', authUser.email);
        this.service
          .getRecordByProperty('drivers', 'email', '==', authUser.email)
          .then((driver) => {
            if (driver && driver.enabled) {
              this.setState(
                {
                  user: driver,
                },
                () => {
                  this.subscribeOrders.bind(self)();
                  AsyncStorage.setItem('user_email', driver.email);
                  if (driver.isSuper) {
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

  subscribeOrders() {
    this.ordersSubscription = this.service
      .observeRecordsByProperties(
        'orders',
        ['type', 'status', 'driver'],
        ['==', '=='],
        ['delivery', 'completed', this.state?.user?.email],
      )
      .subscribe((results) => this.updateOrders(results));
  }

  updateOrders(results) {
    console.log('this.state.user.email', this.state.user.email);
    const orders = [];
    results.forEach((doc: any) => {
      const order: Order = doc.data();

      if (order.driver?.email === this.state.user.email) {
        orders.push(this.renderOrder(order));
      }
    });
    this.setState({orders: orders.reverse()});
  }

  renderOrder(order: Order) {
    return (
      <Card key={order.uid} style={styles.card}>
        <Card.Content>
          <Paragraph>
            <Text style={styles.label}>HORA APROXIMADA: </Text>
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
          {this.state && this.state.deliveringOrder
            ? this.renderOrder(this.state.deliveringOrder)
            : this.state.orders}
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
