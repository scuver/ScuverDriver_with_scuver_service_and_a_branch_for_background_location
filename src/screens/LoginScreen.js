import React, {useState} from 'react';
import {Linking, StyleSheet} from 'react-native';
import {
  Snackbar,
  Button,
  Card,
  Divider,
  Paragraph,
  TextInput,
  Text,
} from 'react-native-paper';
import AsyncStorage from '@react-native-community/async-storage';
// import * as firebase from 'firebase';
import auth from '@react-native-firebase/auth';
import firebase from '@react-native-firebase/app';

const LoginScreen = ({navigation}) => {
  // const [email, setEmail] = useState('goncalo.p.gomes@hotmail.com');
  const [email, setEmail] = useState('');
  // const [password, setPassword] = useState('tmp12345');
  const [password, setPassword] = useState('');
  const [snackVisible, setSnackVisible] = useState(false);
  const [snackText, setSnackText] = useState(false);

  const signIn = () => {
    const mail = email ? email.trim().toLowerCase() : ' ';
    const pass = password ? password.trim() : ' ';
    console.log('email', mail);
    console.log('pass', pass);
    firebase
      .auth()
      .signInWithEmailAndPassword(mail, pass)
      .then((user) => {
        console.log('user', user);
        if (user) {
          AsyncStorage.setItem('user', JSON.stringify(user)).then(() => {
            AsyncStorage.removeItem('visited').then(() => {
              navigation.navigate('Home');
            });
          });
        }
      })
      .catch((err: any) => {
        console.log('err', err);
        setSnackText(err.message);
        setSnackVisible(true);
      });
  };

  return (
    <>
      <Card>
        <Card.Content>
          <Paragraph style={styles.paragraph1}>
            Insira as credenciais de estafeta abaixo.
          </Paragraph>
          <Divider />
          <TextInput
            label="Email"
            value={email}
            mode={'outlined'}
            onChangeText={(text: string) => setEmail(text)}
          />
          <TextInput
            label="Password"
            value={password}
            mode={'outlined'}
            onChangeText={(text: string) => setPassword(text)}
          />
        </Card.Content>
        <Card.Actions>
          <Button style={styles.button} mode={'contained'} onPress={signIn}>
            ENTRAR
          </Button>
        </Card.Actions>
      </Card>
      <Card>
        <Card.Content>
          <Paragraph style={styles.paragraph2}>
            Se não tem o registo envie um e-mail para
          </Paragraph>
          <Button
            onPress={() =>
              Linking.openURL(
                'mailto:scuverpt@gmail.com?subject=Inscricao Estafeta',
              )
            }>
            scuverpt@gmail.com
          </Button>
          <Paragraph style={styles.paragraph3}>
            {' '}
            com o seu nome e número de telefone, zona de entregas e experiência
            profissional.
          </Paragraph>
        </Card.Content>
      </Card>
      <Snackbar
        visible={snackVisible}
        style={styles.snack}
        onDismiss={() => setSnackVisible(false)}>
        <Text style={styles.snackText}>{snackText}</Text>
      </Snackbar>
    </>
  );
};

const styles = StyleSheet.create({
  paragraph1: {
    marginTop: '10%',
    textAlign: 'center',
    marginBottom: '5%',
    fontSize: 20,
  },
  paragraph2: {
    marginTop: '10%',
    textAlign: 'center',
  },
  paragraph3: {
    textAlign: 'center',
    marginBottom: '5%',
  },
  button: {
    width: '90%',
    marginLeft: '5%',
    marginTop: '5%',
  },
  snackText: {
    color: '#ffffff',
  },
});

export default LoginScreen;
