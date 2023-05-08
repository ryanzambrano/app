import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style = { styles.mid }>Start matching with roomates!!</Text>
      <Button title="Sign Up"> Details </Button>
      <View style = {styles.box}></View>
      <View style = {styles.box}></View>
      <View style = {styles.box}></View>
      <View style = {styles.balls}>
        <View style = {styles.box}></View>
        <View style = {styles.box}></View>
      </View>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',

  },

  mid: {
    fontSize: 50,
  },

  box: {
    width: 100, height: 100, backgroundColor: 'green', borderRadius: 1,
  },

  balls: {
    flex: 1,
    flexDirection: 'row',
  }


});
