import React from 'react';
import {StatusBar, StyleSheet} from 'react-native';
import {
  Appbar,
  DefaultTheme,
  Provider as PaperProvider,
  Title,
} from 'react-native-paper';
import NavigationContainer from '@react-navigation/native/src/NavigationContainer';
import LoginScreen from './screens/LoginScreen';
import {createStackNavigator} from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import firebase from '@react-native-firebase/app';
import HistoryScreen from './screens/HistoryScreen';
import MapScreen from './screens/MapScreen';
// import * as firebase from 'firebase';

const firebaseConfig = {
  apiKey: 'AIzaSyDxiMAmLUqiYpWyDipDljWYRsYvKCho7Y0',
  authDomain: 'scuver-data.firebaseapp.com',
  databaseURL:
    'https://scuver-data-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'scuver-data',
  storageBucket: 'scuver-data.appspot.com',
  messagingSenderId: '326732084118',
  appId: '1:326732084118:web:2ad29e73e90879d830e3b7',
};

// const firebaseConfig = {
//   apiKey: 'AIzaSyCdYdIKFcTCV_vwvNLEBE16j1uFM12dhw0',
//   authDomain: 'scuver-staging.firebaseapp.com',
//   projectId: 'scuver-staging',
//   storageBucket: 'scuver-staging.appspot.com',
//   messagingSenderId: '856332062676',
//   appId: '1:856332062676:web:796a403bfef8c04ed91041',
//   measurementId: 'G-HNL4J1TM12',
//   region: 'europe-west1',
//   databaseURL:
//     'https://scuver-staging-default-rtdb.europe-west1.firebasedatabase.app',
// };

if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}

const Stack = createStackNavigator();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#5e8d93',
    accent: '#eb9f12',
  },
};

const App = () => {
  return (
    <PaperProvider theme={theme}>
      <StatusBar barStyle="dark-content" />
      <Appbar>
        <Title style={styles.appbarTitle}>SCUVER DRIVER</Title>
      </Appbar>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={'Home'}>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="History"
            component={HistoryScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="Map"
            component={MapScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{headerShown: false}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  appbarTitle: {
    color: '#ffffff',
    textAlign: 'center',
    marginLeft: '32%',
  },
  scrollView: {
    textAlign: 'center',
    padding: '2%',
  },
});

export default App;
