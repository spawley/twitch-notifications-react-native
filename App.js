import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, TextInput } from 'react-native';
import { styles } from "./Styles";
import firebase from 'react-native-firebase';
import type, { RemoteMessage } from 'react-native-firebase';
import TimerMixin from 'react-timer-mixin';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' +
    'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

type Props = {};

export default class App extends Component<Props> {

  constructor(props) {
    super(props);
    this.state = {
       text: 'Enter Streamer Name Here'
      };
  }

  componentDidMount() {

    let userId = "unknown";

    //todo: keep track that this is already done (only perform once)
    firebase.messaging().getToken().then((x) => {
      console.log(x);

      userId = x;

      firebase.firestore().collection('users').doc(x).set({
        userId: x
      });


      // firebase.firestore().collection('subscribedTo').add({
      //   userId,
      //   streamer: "Shroud",
      //   streamerId: "37402112",
      //   game: "fortnite",
      //   gameId: "33214"
      // });
    });


    // https://api.twitch.tv/helix/users?login=<Channel-Name> - determine if exists


    // firebase.firestore().collection('streamers').doc("Chad").set({
    //   streamerId: "51847140",
    //   name: "Chad",
    //   gameId: "33214",
    //   isOnline: false
    // });


    
    // firebase.database().ref('test').push({
    //   testId: "5"
    // })


  
    //Data    
    firebase.messaging().onMessage((message) => {
        console.log(message);
        console.log("ddd");
    });

    //Notifications
    firebase.notifications().onNotification((notification) => {
      console.log(notification);
    });
}

  render() {

    this.test();

    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Welcome to the Fortnite Twitch Notification App!
        </Text>
        <Text style={styles.instructions}>
          To get started, edit App.js
        </Text>
        <Text style={styles.instructions}>
          {instructions}
        </Text>
        <TextInput
          style={{height: 40, width: 225, borderColor: 'gray', borderWidth: 1}}
          onChangeText={() => this.handleStreamerLookup()}
          defaultValue={this.state.text}
        />
      </View>
      
    ); 
  }

  handleStreamerLookup() {
    console.log("jjj");
    setTimeout(function() { this.setState({text: "kkjhg"}); }.bind(this), 3000);
  }

   async test() {
    const enabled = await firebase.messaging().hasPermission();

    console.log(enabled);
  }
}
