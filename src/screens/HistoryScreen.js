import React from 'react';
import {Button, Card, Paragraph, Text} from 'react-native-paper';
import {AppState, SafeAreaView, ScrollView, StyleSheet} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {Order} from '../model/order';
import firestore from '@react-native-firebase/firestore';

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

const states = {
  viewed: 'Em Preparação',
  ready: 'Pronta para Entrega',
  bringing: 'A Entregar',
};

export default class HistoryScreen extends React.Component {
  ordersSubscription = null;

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
          .get({source: 'server'})
          .then((u) => {
            const fU = u.docs[0] && u.docs[0].data();
            if (fU && fU.enabled) {
              this.setState(
                {
                  user: fU,
                },
                () => {
                  this.subscribeOrders.bind(self)();
                },
              );
            } else {
              // Alert.alert('Info', 'Por favor efetue o login.', null, {
              //   cancelable: true,
              // });
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
      .where('status', '==', 'completed')
      .where('driver.email', '==', this.state?.user?.email)
      .onSnapshot((results) => this.updateOrders(results));
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
    this.setState({orders});
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
