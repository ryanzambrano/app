import React from 'react';
import { View, Text, TouchableOpacity, FlatList,StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';// You can use your preferred icon library
import { AntDesign } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

const GroupChatScreen = ({ }) => {
  const navigation = useNavigation();
  const userList = [
    { id: 1, name: 'User 1' },
    { id: 2, name: 'User 2' },
    { id: 3, name: 'User 3' },
    // Add more users as needed
  ];

  const renderUserItem = ({ item }) => (
    <View style={{ padding: 10 }}>
      <Text>{item.name}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, marginTop: 10, }}>
      {/* Top Bar */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10, }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.button}>
          <AntDesign name="arrowleft" size={24} />
        </TouchableOpacity>
        <Text>Group Chat</Text>
        <View />
      </View>
      
      {/* Profile Picture and Group Name */}
      <View style={{ alignItems: 'center', padding: 0 }}>
        <View style={{ width: 100, height: 100, backgroundColor: 'lightgray', borderRadius: 50 }} />
        <Text style={{ marginTop: 10 }}>Group Name</Text>
        <TouchableOpacity style={{ marginTop: 10 }}>
          <Text>Change Name</Text>
        </TouchableOpacity>
      </View>
      
      {/* Buttons */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', padding: 10 }}>
        <TouchableOpacity style={{ alignItems: 'center', marginRight: 20 }}>
          <AntDesign name="addusergroup" size={24} />
          <Text>Add</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ alignItems: 'center', marginRight: 20 }}>
          <AntDesign name="search1" size={24} />
          <Text>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ alignItems: 'center' }}>
        <Icon name="meeting-room" size={24} color="black" />
          <Text>Leave</Text>
        </TouchableOpacity>
      </View>
      
      {/* User List */}
      <FlatList
        data={userList}
        keyExtractor={item => item.id.toString()}
        renderItem={renderUserItem}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  button: {
    paddingVertical: 20,
}});


export default GroupChatScreen;
