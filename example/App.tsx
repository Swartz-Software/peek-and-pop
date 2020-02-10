import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import PeekAndPop from '@react-native-community/peek-and-pop';

class App extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <PeekAndPop
          renderPreview={() => <View style={styles.preview} />}
          onPeek={() => console.log('onPeek')}
          onPop={() => console.warn('pop')}
          onDisappear={() => console.log('onDisappear')}
          previewActions={[
            {
              type: 'destructive',
              label: 'remove',
              onPress: () => console.warn('1'),
            },
            {
              label: 'normal',
              onPress: () => console.warn('N'),
            },
            {
              type: 'destructive',
              label: 'remove2',
              onPress: () => console.warn('2'),
            },
            {
              type: 'group',
              label: 'group',
              actions: [
                {
                  selected: true,
                  label: 'selected',
                  onPress: () => console.warn('3'),
                },
                {
                  type: 'normal',
                  selected: false,
                  label: 'selected2',
                  onPress: () => console.warn('4'),
                },
              ],
            },
          ]}
        >
          <View style={styles.innerView} />
        </PeekAndPop>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2b0b0c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerView: {
    backgroundColor: 'red',
    width: 130,
    height: 130,
  },
  preview: {
    width: 100,
    height: 100,
    backgroundColor: 'blue',
  },
  tabBar: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#eee',
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  textInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    padding: 10,
    marginHorizontal: 20,
    alignSelf: 'stretch',
    borderColor: 'black',
  },
});

export default App;
