import {Player} from '@react-native-community/audio-toolkit';
import AsyncStorage from '@react-native-community/async-storage';
const Sound = require('react-native-sound');
import BackgroundTimer from 'react-native-background-timer';

Sound.setCategory('Playback');

class NotificationSoundClass {
  player = new Player('whoosh.mp3', {
    continuesToPlayInBackground: true,
  });
  interval = null;

  startPlaying() {
    AsyncStorage.setItem('play_sound', 'yes');
  }

  stopPlaying() {
    AsyncStorage.removeItem('play_sound');
  }

  startCheckingIfShouldPlayForeground() {
    this.stopCheckingIfShouldPlayForeground();
    this.interval = setInterval(() => {
      this.checkIfPlaySound('foreground');
    }, 3000);
  }

  startCheckingIfShouldPlayBackground() {
    this.stopCheckingIfShouldPlayBackground();
    const self = this;
    BackgroundTimer.runBackgroundTimer(() => {
      self.checkIfPlaySound('background');
    }, 3000);
  }

  checkIfPlaySound(state) {
    // console.log('Will check if play_sound', state);
    AsyncStorage.getItem('play_sound').then((playSound) => {
      // console.log('playSound', playSound);
      if (playSound) {
        this.player.looping = true;
        this.player.play();
      } else {
        this.player.looping = false;
        this.player?.pause();
      }
    });
  }

  stopCheckingIfShouldPlayForeground() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  stopCheckingIfShouldPlayBackground() {
    BackgroundTimer.stopBackgroundTimer();
  }
}

const NotificationSound = new NotificationSoundClass();
export default NotificationSound;
