import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';

const UserCard = ({ navigation, route }) => {
  const { name, bio } = route.params.user;

  const goBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>{'< Back'}</Text>
        </TouchableOpacity>
        <Text style={styles.name}>{name}</Text>
      </View>

      {/* <ScrollView horizontal style={styles.photoContainer}>
        {photos.map((photo, index) => (
          <Image key={index} source={{ uri: photo }} style={styles.photo} />
        ))}
      </ScrollView> */}

      <View style={styles.bioContainer}>
        <Text style={styles.bio}>{bio}</Text>
      </View>

      {/* <View style={styles.infoTable}>
        <View style={styles.row}>
          <Text style={styles.label}>Birthday:</Text>
          <Text style={styles.value}>{birthday}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Grade Level:</Text>
          <Text style={styles.value}>{gradeLevel}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Major:</Text>
          <Text style={styles.value}>{major}</Text>
        </View>
      </View> */}

    </SafeAreaView>


  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    color: 'blue',
    fontSize: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  photoContainer: {
    height: 200,
    marginBottom: 16,
  },
  photo: {
    width: 200,
    height: 200,
    marginRight: 8,
  },
  bioContainer: {
    marginBottom: 16,
  },
  bio: {
    fontSize: 16,
  },
  infoTable: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontWeight: 'bold',
    width: '40%',
  },
  value: {
    width: '60%',
  },
});

export default UserCard;
