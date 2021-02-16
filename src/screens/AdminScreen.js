import React, {useEffect} from 'react';
import {Link} from '@react-navigation/native';
import {Linking} from 'react-native';
import {Button} from 'react-native-paper';

const AdminScreen = ({navigation}) => {
  const openIt = () => {
    Linking.openURL('http://admin.scuver.pt');
    navigation.navigate('Encomendas');
  };

  useEffect(() => {
    openIt();
    const unsubscribe = navigation.addListener('tabPress', openIt);
    return unsubscribe;
  });

  return (
    <>
      <Button style={{marginTop: '50%'}} onPress={openIt}>
        Abrir Administração
      </Button>
    </>
  );
};

export default AdminScreen;
