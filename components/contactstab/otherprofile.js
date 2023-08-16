import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AntDesign } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { supabase } from "../auth/supabase";

const GroupChatScreen = ({ }) => {
  const route = useRoute();
  const { session } = route.params;
  const { user } = route.params;
  const navigation = useNavigation();
  const [editedJoinedGroups, setEditedJoinedGroups] = useState(user.joinedGroups);
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

  const updateJoinedGroups = async () => {
    try {
      // Update the joined groups in Supabase
      const { data, error } = await supabase
        .from('Group Chats')
        .update({ Group_Name: editedJoinedGroups })
        .eq('Group_ID', user.Group_ID);
  
      if (error) {
        console.error('Error updating joined groups:', error);
      } else {
        //console.log('Joined groups updated successfully:', data);
      }
    } catch (error) {
      console.error('An error occurred:', error.message);
    }
  };
  const navigatetomessages = () => {
    navigation.navigate("Message", { editedJoinedGroups: editedJoinedGroups, user: user });
  };

  return (
    <View style={{ flex: 1, marginTop: 10 }}>
      {/* Top Bar */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 14 }}>
        <TouchableOpacity onPress={navigatetomessages} style={styles.button}>
          <AntDesign name="arrowleft" size={24} />
        </TouchableOpacity>
        <View />
      </View>

      {/* Profile Picture and Group Name */}
      <View style={{ alignItems: 'center', padding: 0 }}>
        <View style={{ width: 100, height: 100, backgroundColor: 'lightgray', borderRadius: 50 }} />
        <TouchableOpacity onPress={updateJoinedGroups}>
  <TextInput
    style={{ marginTop: 15, marginBottom: 15, fontSize: 20, fontWeight: 'bold',}}
    value={editedJoinedGroups}
    onChangeText={setEditedJoinedGroups}
    onBlur={updateJoinedGroups} // Update when input is blurred
  />
</TouchableOpacity>
      </View>

      {/* Buttons */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', padding: 10 }}>
        <TouchableOpacity style={{ alignItems: 'center', marginRight: 50 }}>
          <AntDesign name="addusergroup" size={24} />
          <Text>Add</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ alignItems: 'center', marginRight: 50, marginBottom: 20 }}>
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
  },
});

export default GroupChatScreen;
