    import React from 'react';
    import Icon from 'react-native-vector-icons/FontAwesome';
    import { Platform, StyleSheet, Text, View, TextInput, ActivityIndicator, AsyncStorage, ToastAndroid, FlatList, TouchableOpacity} from 'react-native';

    export default class StreamerDetails extends React.Component {

      constructor(props) {
        super(props);
        this.state = {
           streamer: null,
           acceptInput: false,
           loading: false,
           timeout: null,
           multipleResults: null
          };
      }

      static navigationOptions = {
        title: 'Modal',
      };

      componentDidMount() {

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
             })
             .catch((error) => {
                console.error(error);
             });
            }, 800),
          })
        }
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
                          <Text style={{fontSize: 20, padding:10}}>{item.name}</Text>
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