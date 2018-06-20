import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, TextInput, ActivityIndicator, AsyncStorage, ToastAndroid, FlatList, TouchableOpacity} from 'react-native';
import { styles } from "../Styles";
import firebase from 'react-native-firebase';
import type, { RemoteMessage } from 'react-native-firebase';
import TimerMixin from 'react-timer-mixin';
import Button from 'react-native-button';


const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' +
    'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

type Props = {};

export default class App extends Component<Props> {

  static navigationOptions = {
    title: "Home Screen"
  }

  constructor(props) {
    super(props);
    this.state = {
       streamerNameInput: '',
       timeout: null,
       streamerId: '',
       loading: false,
       showAddButton: false,
       userId: '',
       streamersSubscribedTo: []
      };
  }

  componentDidMount() {

    let userId = "unknown";

    // const req = AsyncStorage.getItem('streamersSubscribedTo')

    //     console.log(JSON.stringify(req));

        // const streamers = req ? JSON.parse(req) : []

        // this.setState({streamersSubscribedTo: streamers});

        // AsyncStorage.removeItem('streamersSubscribedTo');


        AsyncStorage.getItem('streamersSubscribedTo')
        .then((item) => {
          console.log(item);
            if (item) {
              this.setState({streamersSubscribedTo: JSON.parse(item)});
            }
        });


    //todo: keep track that this is already done (only perform once)
    firebase.messaging().getToken().then((x) => {
      console.log(x);

      userId = x;

      firebase.firestore().collection('users').doc(x).set({
        userId: x
      });

      this.setState({
        userId: x
      })

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

  componentWillUpdate(nextProps, nextState) {

    // if(this.state.streamersSubscribedTo && this.state.streamersSubscribedTo !== nextState.streamersSubscribedTo){

    //   AsyncStorage.getItem('streamersSubscribedTo')
    //   .then((item) => {
    //     console.log(item);
    //       if (item) {
    //         this.setState({streamersSubscribedTo: JSON.parse(item)});
    //       }
    //   });
    // }
  }

  render() {

    const { navigate } = this.props.navigation;

    this.test();

    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Welcome to the Fortnite Twitch Notification App!!
        </Text>
        <Text style={styles.instructions}>
          {this.state.streamerId ? "Valid" : "Does not exist"}
        </Text>
        <Text style={styles.instructions}>
          {instructions}
        </Text>
        <View
          style={{
            flexDirection: 'row',
          }}
        >
          <TextInput
            style={{height: 40, width: 150}}
            onChangeText={(e) => this.handleStreamerLookup(e)}
            defaultValue={this.state.streamerNameInput}
            placeholder={"Search Streamer Here"}
          />
          {
            this.state.loading
              ? <ActivityIndicator
                style={{}}
                size="small" 
                color="#0000ff"
                animating={true}
               />
              : null
          }
          {
            this.state.showAddButton
              ? <Button
                  containerStyle={{padding:8, paddingTop:5.5, height:30, width:60, overflow:'hidden', borderRadius:4, backgroundColor: 'blue', marginTop:5}}
                  disabledContainerStyle={{backgroundColor: 'grey'}}
                  style={{fontSize: 14, color: 'green'}}
                  onPress={() => this.addStreamer()}
                >
                  Add
               </Button>
              : null
          }
        </View>
        <FlatList
          style={{width:"95%"}}
          data={this.state.streamersSubscribedTo}
          showsVerticalScrollIndicator={false}
          renderItem={({item}) =>
          <TouchableOpacity onPress={
            () => {
              console.log(item.id);

              this.props.navigation.navigate('StreamerDetails', {
                streamerId: item.id,
              });

            }}>
            <View style={{marginTop:25, flexDirection: 'row', width:"95%", flexDirection: 'row', justifyContent: 'flex-start'}}>
              <View style={{flex: 1}}>
                <Text style={{fontSize: 20, padding:10}}>{item.name}</Text>
              </View>
              <Button
                containerStyle={{padding:8, paddingTop:5.5, height:30, width:100, overflow:'hidden', borderRadius:4, backgroundColor: 'blue', marginTop:5, alignSelf: 'flex-end', position:'relative', right:0}}
                disabledContainerStyle={{backgroundColor: 'grey'}}
                style={{fontSize: 14, color: 'green'}}
                onPress={() => this.removeStreamer(item.id)}
              >
                Remove
              </Button>
            </View>
            </TouchableOpacity>
          }
          keyExtractor={item => item.id}
          onPress={() => {
            () => {console.log("eeeeeeeeeeeeeeeeee");}
          }}
        />
      </View>   
    );
  }
  
  handleStreamerLookup(e) {
    console.log(e);

    clearTimeout(this.state.timeout);

    this.setState({
      loading:false,
      showAddButton: false
    })

    if(e) {

      this.setState({
        loading: true,
        timeout: setTimeout(() => {

          e = e.replace(/\s/g, '');
  
          fetch('https://us-central1-twitch-notification-12e6a.cloudfunctions.net/userCheck?streamerName=' + e.toString(), {
            method: 'GET'
         })
         .then((response) => response ? response.json() : "")
         .then((responseJson) => {

          const jsonObject = JSON.parse(responseJson);
    
            this.setState({
              streamerId: jsonObject.id,
              streamerNameInput: jsonObject.name,
              loading: false,
              showAddButton: !!responseJson
            })
    
            console.log("returned data " + responseJson.toString());
            
         })
         .catch((error) => {
            console.error(error);
         });
        }, 800),
      })
    }
  }

  addStreamer() {

      firebase.firestore().collection('streamers').doc(this.state.streamerId).set({
        streamerId: this.state.streamerId,
        name: this.state.streamerNameInput,
        gameId: "33214",
        isOnline: false
      });

      AsyncStorage.getItem('streamersSubscribedTo')
      .then((item) => {
          console.log(item);

          const subArray = item ? JSON.parse(item) : []

          if (subArray.filter(e => e.id === this.state.streamerId).length === 0) {

            console.log("worked");
      
            firebase.firestore().collection('subscribedTo').add({
              userId: this.state.userId,
              streamer: this.state.streamerNameInput,
              streamerId: this.state.streamerId,
              game: "Fortnite",
              gameId: "33214"
            });

            const streamerData = {
              id: this.state.streamerId,
              name: this.state.streamerNameInput
            }
      
            subArray.push(streamerData);
      
            AsyncStorage.setItem('streamersSubscribedTo', JSON.stringify(subArray))
            .then(this.setState({streamersSubscribedTo: subArray}))
            .catch(error => console.log('error saving data'));
      
            // AsyncStorage.setItem('user', JSON.stringify(subArray))
            // .then((item) => {
            //   console.log(item);
            // });
            }
            else {
              console.log("already added");

              ToastAndroid.show('A pikachu appeared nearby !', ToastAndroid.SHORT);
            }
      });
    }

    removeStreamer(streamerId) {

      firebase.firestore().collection('subscribedTo')
        .where('userId', '==', this.state.userId)
        .where('streamerId', '==', streamerId).get()
          .then(snapshot => {
            snapshot.forEach(doc => {
              doc.ref.delete();
           });
        })
        .catch(err => {
          console.log('Error getting documents', err);
        });


        AsyncStorage.getItem('streamersSubscribedTo')
        .then((item) => {

          const subArray = item ? JSON.parse(item) : []

          const newSubArray = subArray.filter(e => e.id !== streamerId);

          AsyncStorage.setItem('streamersSubscribedTo', JSON.stringify(newSubArray))
          .then(this.setState({streamersSubscribedTo: newSubArray}))
          .catch(error => console.log('error saving data'));
        });

    }

   async test() {
    const enabled = await firebase.messaging().hasPermission();

    console.log(enabled);
  }
}