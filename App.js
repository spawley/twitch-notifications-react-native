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


    let userId = "unknown";

    //todo: keep track that this is already done (only perform once)
    firebase.messaging().getToken().then((x) => {
      console.log(x);

      userId = x;

      firebase.firestore().collection('users').doc(x).set({
        userId: x
      });


      firebase.firestore().collection('subscribedTo').add({
        userId,
        streamer: "Shroud",
        game: "fortnite"
      });
    });


    // https://api.twitch.tv/helix/users?login=<Channel-Name> - determine if exists


    firebase.firestore().collection('streamers').doc("Shroud").set({
      name: "Shroud"
    });


    
    // firebase.database().ref('test').push({
    //   testId: "5"
    // })

    // firebase.messaging().onMessage((message) => {
    //     console.log(message);
    //     console.log("ddd");
    // });

    firebase.notifications().onNotification((notification) => {
      console.log(notification);
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
