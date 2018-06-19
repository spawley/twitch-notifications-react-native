    import React from 'react';
    import { Platform, StyleSheet, Text, View, TextInput, ActivityIndicator, AsyncStorage, ToastAndroid, FlatList, TouchableOpacity} from 'react-native';

    export default class StreamerDetails extends React.Component {

      constructor(props) {
        super(props);
        this.state = {
           streamer: null
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

          console.log("ddddddddddddddddddddddddddddd");

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

      render() {

        const thing = this.state.streamer != null ? this.state.streamer.name : "nope"

        return (

          <View style={this.styles.container}>
            <Text>{"You've reached the second scre97eeen. You can go baaack now." + thing}</Text>

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