    import React from 'react';
    import Icon from 'react-native-vector-icons/FontAwesome';
    import { Platform, StyleSheet, Text, View, TextInput, ActivityIndicator, AsyncStorage, ToastAndroid, FlatList, TouchableOpacity} from 'react-native';
    import Button from 'react-native-button';


    export default class StreamerDetails extends React.Component {

      constructor(props) {
        super(props);
        this.state = {
           streamer: null,
           acceptInput: false,
           loading: false,
           timeout: null,
           multipleResults: null,
           showGameSubscribeButton: false,
           gameSelected: null,
           gamesSubscribedTo: [{}]
          };
      }

      static navigationOptions = {
        title: 'Streamer',
      };

      componentDidMount() {

                AsyncStorage.removeItem('gamesSubscribedTo');


        const itemId = this.props.navigation.getParam('streamerId', 'NO-ID');
        console.log(itemId);

        AsyncStorage.getItem('streamersSubscribedTo')
        .then((item) => {

          const subArray = item ? JSON.parse(item) : []
          const newSubArray = subArray.filter(e => e.id === itemId);

          this.setState({
            streamer: newSubArray[0]
          });
        });

        AsyncStorage.getItem('gamesSubscribedTo')
        .then((item) => {

          console.log(item);

          const gameArray = item 
            ? JSON.parse(item) 
            : [{
                id: itemId,
                games: []
              }]
          const newGameArray = gameArray.filter(e => e.id === itemId);

          console.log(newGameArray);


          this.setState({
            gamesSubscribedTo: newGameArray[0]
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
                    multipleResults: resultArray
                  });
                }
                else if(result.games.length === 1) {

                  let gameSelected = {
                    id: result.games[0]._id.toString(),
                    name: result.games[0].name
                  }

                  this.setState({
                    gameSelected: JSON.stringify(gameSelected),
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

      addGame() {

        console.log(JSON.parse(this.state.gameSelected));

        const gameSelected = JSON.parse(this.state.gameSelected);
        const gamesSubscribedTo = this.state.gamesSubscribedTo;

        if (gamesSubscribedTo.games) {
          gamesSubscribedTo.games.push(gameSelected);
        }
        else {
          gamesSubscribedTo.games = [gameSelected];
        }

        console.log(gamesSubscribedTo);

        AsyncStorage.setItem('gamesSubscribedTo', JSON.stringify(gamesSubscribedTo))
        .then(this.setState({gamesSubscribedTo: gamesSubscribedTo}))
        .catch(error => console.log('error saving data'));
      }

      render() {

        const streamer = this.state.streamer != null ? this.state.streamer : "nope"

        return (

          <View style={this.styles.container}>
            <Text style={{fontSize:28}}>{streamer.name}</Text>

            {
              this.state.acceptInput === false
                ? <Icon.Button 
                    name="plus" 
                    backgroundColor="#3b5998"
                    onPress={() => this.setState({acceptInput: true})}
                  >
                    Add Game Subscription
                  </Icon.Button>
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
                        ? <Button
                            containerStyle={{padding:8, paddingTop:5.5, height:30, width:60, overflow:'hidden', borderRadius:4, backgroundColor: 'blue', marginTop:5}}
                            disabledContainerStyle={{backgroundColor: 'grey'}}
                            style={{fontSize: 14, color: 'green'}}
                            onPress={() => this.addGame()}
                          >
                            Add
                        </Button>
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
          justifyContent: 'center',
        },

        button: {
          height: 45,
          width: 350,
          backgroundColor:"#0075ff",
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 10,
          marginTop: 200,
        }
      })
    }