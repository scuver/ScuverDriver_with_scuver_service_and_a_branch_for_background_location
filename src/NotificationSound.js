import {Player} from '@react-native-community/audio-toolkit';
import AsyncStorage from '@react-native-community/async-storage';
const Sound = require('react-native-sound');
import BackgroundTimer from 'react-native-background-timer';
import firestore from '@react-native-firebase/firestore';

Sound.setCategory('Playback');

class NotificationSoundClass {
  player = new Player('whoosh.mp3', {
    continuesToPlayInBackground: true,
    mixWithOthers: true,
    autoDestroy: false,
  });
  interval = null;
  email;
  isSuper;
  playing = false;
  ordersSubscription;

  initialize() {
    this.start();
  }

  enablePlay() {
    AsyncStorage.setItem('play_sound', 'yes');
  }

  disablePlay() {
    AsyncStorage.removeItem('play_sound');
  }

  start() {
    this.stop();
    AsyncStorage.getItem('user_email').then((e) => (this.email = e));
    AsyncStorage.getItem('user_is_super').then((e) => (this.isSuper = e));
    BackgroundTimer.runBackgroundTimer(this.checkOrders.bind(this), 500);
    this.interval = setInterval(this.checkOrders.bind(this), 500);
  }

  checkOrders() {
    // console.log('ordersSUB', this.ordersSubscription);
    if (!this.ordersSubscription) {
      this.ordersSubscription = firestore()
        .collection('orders')
        .where('type', '==', 'delivery')
        .where('status', 'in', ['pending', 'viewed', 'ready'])
        .onSnapshot((results) => {
          let found = false;
          results.forEach((r) => {
            const o = r.data();
            if (!o.driver && (this.isSuper || o.status !== 'pending')) {
              found = true;
            }
          });
          if (found) {
            this.enablePlay();
          } else {
            this.disablePlay();
          }
          this.checkIfPlaySound();
        });
    }
    this.checkIfPlaySound();
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

  stop() {
    BackgroundTimer.stopBackgroundTimer();
    if (this.ordersSubscription) {
      this.ordersSubscription();
    }
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}

const NotificationSound = new NotificationSoundClass();
export default NotificationSound;
