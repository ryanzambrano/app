import React from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TextInput, View, Image, SafeAreaView } from 'react-native';
import { Button } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#eBecf4' }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Image
            source={{ uri: "https://th.bing.com/th/id/R.2e5759904001f6bfb51514cfe25d9fae?rik=mjp6tYknw47rEA&riu=http%3a%2f%2fwww.newdesignfile.com%2fpostpic%2f2009%2f07%2fhome-button-icon_6176.png&ehk=Lun4Q0YhJO1adNrK72JB3%2brQm5p6s2ug3vWUBSJnthA%3d&risl=&pid=ImgRaw&r=0"}}
            style={styles.headerImage}
            alt="Logo "
          />
          <Text style = { styles.titleText }>Sign into RoomBa</Text>
          <Text style = { styles.sloganText }>Find and meet new roomates, for any situation!</Text>
        </View>
        

      </View>

    </SafeAreaView>

    
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flex: 1,
    // backgroundColor: 'white',
    // alignItems: 'center',
    // justifyContent: 'center',
  },

  header: {
    marginVertical: 36,
  },

  headerImage: {
    width: 90,
    height: 90,
    alignSelf: 'center',
    marginBottom: 33,
  },

  titleText: {
    fontFamily: 'Verdana-Bold',
    fontSize: 27,
    fontWeight: '700',
    textAlign: "center",
    marginBottom: 8,
    color: '#1e1e1e',
  },

  sloganText: {
    fontFamily: 'Verdana',
    fontSize: 15,
    fontWeight: '500',
    color: '#929292',
    textAlign: "center",
  },


  

  none: {
    
  }


});
