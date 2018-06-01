import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { styles } from "./Styles";
import firebase from 'react-native-firebase';
import type, { RemoteMessage } from 'react-native-firebase';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' +
    'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

type Props = {};
export default class App extends Component<Props> {

  componentDidMount() {

    console.log(firebase.messaging().getToken());



    firebase.messaging().onMessage((message) => {
        console.log(message);
        console.log("ddd");
    });
}

  render() {

    this.test();

    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Welcome to React Native!!
        </Text>
        <Text style={styles.instructions}>
          To get started, edit App.js
        </Text>
        <Text style={styles.instructions}>
          {instructions}
        </Text>
      </View>
    );
  }

   async test() {
    const enabled = await firebase.messaging().hasPermission();

    console.log(enabled);

  }
}
