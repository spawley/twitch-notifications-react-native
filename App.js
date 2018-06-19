import React from 'react';

import { StackNavigator } from 'react-navigation';
import Home from './screens/Home';
import StreamerDetails from './screens/StreamerDetails';

const App = StackNavigator({
    Home: { screen: Home},
    StreamerDetails: { screen: StreamerDetails},
})

export default App;