    import React from 'react';
    import Icon from 'react-native-vector-icons/FontAwesome';
    import { Platform, StyleSheet, Text, View, TextInput, ActivityIndicator, AsyncStorage, ToastAndroid, FlatList, TouchableOpacity} from 'react-native';
    import Button from 'react-native-button';
    import { HeaderBackButton } from 'react-navigation';
    import firebase from 'react-native-firebase';



    export default class StreamerDetails extends React.Component {

      constructor(props) {
        super(props);
        this.navigate = this.props.navigation.navigate;      
        this.state = {
           streamer: null,
           streamerName: this.props.navigation.getParam('streamerName', 'NO-ID'),
           streamerId: this.props.navigation.getParam('streamerId', 'NO-ID'),
           acceptInput: false,
           loading: false,
           timeout: null,
           multipleResults: null,
           showGameSubscribeButton: false,
           gameSelected: null,
           gamesSubscribedTo: {
              id: this.props.navigation.getParam('streamerId', 'NO-ID'),
              games: []
            },
           allSubscriptions: []
          };
      }

      static navigationOptions = ({ navigation }) => ({
        title: 'Streamer',
        headerLeft: <HeaderBackButton onPress={() => navigation.goBack(null)} />
      })

      componentDidMount() {

        // AsyncStorage.removeItem('gamesSubscribedTo');

        AsyncStorage.getItem('gamesSubscribedTo')
        .then((item) => {

          console.log(item);

          const gameArray = item 
            ? JSON.parse(item) 
            : [{
                id: this.props.navigation.getParam('streamerId', 'NO-ID'),
                games: []
              }]
             

          console.log(gameArray);

          const newGameArray = gameArray.filter(e => e.id === this.props.navigation.getParam('streamerId', 'NO-ID'));

          console.log(newGameArray);

          let gamesSubscribedTo = this.state.gamesSubscribedTo;

          if(newGameArray.length > 0) {
            gamesSubscribedTo = newGameArray[0];
          }

          this.setState({
            gamesSubscribedTo: gamesSubscribedTo,
            allSubscriptions: item ? gameArray : []
          });
        });
      }

      modalScreenButtonPressed() {
        this.props.navigation.goBack()
      }

      handleGameLookup(e) {
        console.log(e);

        clearTimeout(this.state.timeout);
    
        this.setState({
          loading:false,
        })
    
        if(e) {
    
          this.setState({
            loading: true,
            timeout: setTimeout(() => {
    
              // e = e.replace(/\s/g, '');

              const userInput = encodeURI(e);

              let url = 'https://us-central1-twitch-notification-12e6a.cloudfunctions.net/gameCheck?game=' + userInput
      
              fetch(url, {
                method: 'GET'
             })
             .then((response) => response ? response.json() : "")
             .then((responseJson) => {
    
              // const jsonObject = JSON.parse(responseJson);
        
                this.setState({
                  loading: false,
                })
        
                console.log("returned data " + JSON.stringify(responseJson));

                const result = JSON.parse(responseJson);


                if(result.games.length > 1) {
                  console.log("Multiple returned, show listview....");


                  const resultArray = [];

                  result.games.map((game) => {
                    console.log(game);
                    resultArray.push(game);
                  });

                  this.setState({
                    multipleResults: resultArray,
                    showGameSubscribeButton: true
                  });
                }
                else if(result.games.length === 1) {

                  let gameSelected = {
                    id: result.games[0]._id.toString(),
                    name: result.games[0].name
                  }

                  console.log("Initial Check: " + result.games[0].name);

                  this.setState({
                    gameSelected: gameSelected,
                    showGameSubscribeButton: true
                  });
                }
                else {
                  console.log("Nothing");
                }
             })
             .catch((error) => {
                console.error(error);
             });
            }, 800),
          })
        }
      }

      addGame(item) {

        console.log(item);

        let gameSelected = {
          id: item.id.toString(),
          name: item.name
        }

        // console.log(JSON.parse(this.state.gameSelected));

        // const gameSelected = JSON.parse(this.state.gameSelected);
        const gamesSubscribedTo = this.state.gamesSubscribedTo;

        if (gamesSubscribedTo.games) {
          gamesSubscribedTo.games.push(gameSelected);
        }
        else {
          gamesSubscribedTo.games = [gameSelected];
        }

        console.log("---------------------");

        console.log(this.state.allSubscriptions);

        const newGameArray = this.state.allSubscriptions.filter(e => e.id === this.state.streamerId);

        const excludeCurrentStreamer = this.state.allSubscriptions.filter(e => e.id !== this.state.streamerId);

        console.log(newGameArray);

        console.log(gamesSubscribedTo);

        console.log("---------------------");



        newGameArray.push(gamesSubscribedTo);


        //fix names and everything ****
        excludeCurrentStreamer.push(newGameArray[0]);


        AsyncStorage.setItem('gamesSubscribedTo', JSON.stringify(excludeCurrentStreamer))
        .then (

          firebase.firestore().collection('subscriptions').add({
            userId: this.props.navigation.getParam('userId', 'NO-ID'),
            streamer: this.state.streamerName,
            streamerId: this.state.streamerId,
            game: gameSelected.name,
            gameId: gameSelected.id,
          }),

          this.setState({
            gamesSubscribedTo: gamesSubscribedTo,
            acceptInput: false,
            showGameSubscribeButton: false
          })
        )
        .catch(error => console.log('error saving data'));
      }

      render() {


        console.log(this.state.gamesSubscribedTo);


        if (this.state.gamesSubscribedTo) {
          console.log(this.state.gamesSubscribedTo.games);
        }

        const streamer = this.state.streamerName ? this.state.streamerName : "nope"

        return (

          <View style={this.styles.container}>
            <Text style={{fontSize:28}}>{streamer}</Text>

            {
              this.state.acceptInput === false
                ? <View>
                    <Icon.Button 
                      name="plus" 
                      backgroundColor="#3b5998"
                      onPress={() => this.setState({acceptInput: true})}
                    >
                      Add Game Subscription
                    </Icon.Button>

                    {
                      this.state.gamesSubscribedTo &&
                       this.state.gamesSubscribedTo.games && 
                       this.state.gamesSubscribedTo.games.length > 0
                        ? <FlatList
                            style={{}}
                            data={this.state.gamesSubscribedTo.games}
                            showsVerticalScrollIndicator={false}
                            renderItem={({item}) =>

                            <TouchableOpacity onPress={
                              () => {
                                console.log(item.name);
                  
                              }}>
                              <View style={{marginTop:25, flexDirection: 'row', width:"95%", flexDirection: 'row', justifyContent: 'flex-start'}}>
                                <View style={{flex: 1}}>
                                  <Text style={{fontSize: 14, padding:10}}>{item.name}</Text>
                                </View>
                              </View>
                              </TouchableOpacity>
                            }
                            keyExtractor={(item, index) => index.toString()}
                            />
                        : null
                    }
                  </View>
                : <View
                    style={{
                      flexDirection: 'row',
                    }}
                  >
                    <TextInput
                      style={{height: 40, width: 130}}
                      onChangeText={(e) => this.handleGameLookup(e)}
                      defaultValue={this.state.streamerNameInput}
                      placeholder={"Search Game Here"}
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
                      this.state.showGameSubscribeButton
                        ? <View>
                            <Button
                              containerStyle={{padding:8, paddingTop:5.5, height:30, width:60, overflow:'hidden', borderRadius:4, backgroundColor: 'blue', marginTop:5}}
                              disabledContainerStyle={{backgroundColor: 'grey'}}
                              style={{fontSize: 14, color: 'green'}}
                              onPress={() => this.addGame(this.state.gameSelected)}
                            >
                              Add
                            </Button>
                          </View>
                        : null
                  }
                  </View>
            }

            {
              this.state.multipleResults
                ? <FlatList
                    style={{width:"95%"}}
                    data={this.state.multipleResults}
                    showsVerticalScrollIndicator={false}
                    renderItem={({item}) =>

                      <View style={{marginTop:25, flexDirection: 'row', width:"95%", flexDirection: 'row', justifyContent: 'flex-start'}}>
                        <View style={{flex: 1}}>
                          <Text style={{fontSize: 14, padding:10}}>{item.name}</Text>
                        </View>

                        {
                          this.state.showGameSubscribeButton
                            ? <View>
                                <Button
                                  containerStyle={{padding:8, paddingTop:5.5, height:30, width:60, overflow:'hidden', borderRadius:4, backgroundColor: 'blue', marginTop:5}}
                                  disabledContainerStyle={{backgroundColor: 'grey'}}
                                  style={{fontSize: 14, color: 'green'}}
                                  onPress={() => {

                                    const gameSelected = {
                                      id: item._id.toString(),
                                      name: item.name
                                    }

                                    this.addGame(gameSelected)
                                  }
                                }
                                >
                                  Add
                                </Button>
                              </View>
                            : null
                        }
                      </View>

                    }
                    keyExtractor={(item, index) => index.toString()}
                    onPress={() => {
                      () => {console.log("eeeeeeeeeeeeeeeeee");}
                    }}
                  />
              : null
            }
          
            <TouchableOpacity onPress={() => this.modalScreenButtonPressed()}>
              <View style={this.styles.button}>
                <Text style={{color: 'white'}}>{"Go back"}</Text>
              </View>
            </TouchableOpacity>

          </View>
        )
      }

      styles = StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: '#fff',
          alignItems: 'center',
        }
      })
    }