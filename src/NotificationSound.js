import {Player} from '@react-native-community/audio-toolkit';
import AsyncStorage from '@react-native-community/async-storage';
const Sound = require('react-native-sound');
import BackgroundTimer from 'react-native-background-timer';
import firestore from '@react-native-firebase/firestore';

Sound.setCategory('Alarm');

class NotificationSoundClass {
  player = new Player('whoosh.mp3', {
    continuesToPlayInBackground: true,
  });
  interval = null;
  email;
  isSuper;
  playing = false;

  initialize() {
    this.startCheckingIfShouldPlay();
  }

  startPlaying() {
    AsyncStorage.setItem('play_sound', 'yes');
  }

  stopPlaying() {
    AsyncStorage.removeItem('play_sound');
  }

  startCheckingIfShouldPlay() {
    this.stopCheckingIfShouldPlay();
    AsyncStorage.getItem('user_email').then((e) => (this.email = e));
    AsyncStorage.getItem('user_is_super').then((e) => (this.isSuper = e));
    BackgroundTimer.runBackgroundTimer(this.checkOrders.bind(this), 500);
    setInterval(this.checkOrders.bind(this), 500);
  }

  checkOrders() {
    firestore()
      .collection('orders')
      .where('type', '==', 'delivery')
      .where('status', 'in', ['pending', 'viewed', 'ready'])
      .get({source: 'server'})
      .then((results) => {
        let found = false;
        results.forEach((r) => {
          const o = r.data();
          if (!o.driver && (this.isSuper || o.status !== 'pending')) {
            found = true;
          }
        });
        if (found) {
          this.startPlaying();
        } else {
          this.stopPlaying();
        }
        this.checkIfPlaySound();
      });
  }

  checkIfPlaySound() {
    // console.log('Will check if play_sound');
    AsyncStorage.getItem('play_sound').then((playSound) => {
      // console.log('playSound', playSound);
      if (playSound) {
        if (!this.playing) {
          this.player.looping = true;
          this.player.play();
        }
      } else {
        this.player.looping = false;
        this.player?.pause();
        this.playing = false;
      }
    });
  }

  stopCheckingIfShouldPlay() {
    BackgroundTimer.stopBackgroundTimer();
  }
}

const NotificationSound = new NotificationSoundClass();
export default NotificationSound;
