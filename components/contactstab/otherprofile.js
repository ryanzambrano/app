import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AntDesign } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { supabase } from "../auth/supabase";

const GroupChatScreen = ({ }) => {
  const [persons, setPersons] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const route = useRoute();
  const { session } = route.params;
  const { user } = route.params;
  const navigation = useNavigation();
  const [editedJoinedGroups, setEditedJoinedGroups] = useState(user.joinedGroups);
  const [userIds, setUserIds] = useState([]);
  
  useEffect(() => {
    // Extract session.user.id values from user.User_ID array
    const extractedIds = user.User_ID.filter(item => item !== session.user.id);
  
    // Fetch users based on extractedIds
    async function fetchUsers() {
      try {
        const { data, error } = await supabase
          .from('UGC')
          .select('*')
          .in('user_id', extractedIds);
  
        if (error) {
          console.error('Error fetching users:', error);
        } else {
          
      if (data && data.length > 0) {
        const fetchedPersons = data.map(person => person);
        setPersons(fetchedPersons); // Update the persons state with fetched data
      } else {
        console.log('No users found for the extracted IDs');
      }
        }
      } catch (error) {
        console.error('An error occurred:', error.message);
      }
    }
  
    // Call the fetchUsers function
    fetchUsers();
  }, [user.User_ID, session.user.id]);

  
  const handleUserPress = (person) => {
    // Set the selected person in state
    setSelectedPerson(person);

    // Navigate to Message page and pass selected person data
    navigation.navigate('userCard', { user: person });
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleUserPress(item)}>
      <View style={styles.contactContainer}>
        <Image
          source={{ uri: "https://upload.wikimedia.org/wikipedia/commons/f/f1/Andrew_Tate_on_%27Anything_Goes_With_James_English%27_in_2021.jpg" }} // Use the actual field for the profile picture
          style={styles.profilePicture}
        />
        <Text style={styles.contactName}>{item.name}</Text>
      </View>
    </TouchableOpacity>
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
    <View style={{ flex: 1, backgroundColor: "#1D1D20", }}>
      {/* Top Bar */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 14 }}>
        <TouchableOpacity onPress={navigatetomessages} style={styles.button}>
          <AntDesign name="arrowleft" size={24} color = "#159e9e"/>
        </TouchableOpacity>
        <View />
      </View>

      {/* Profile Picture and Group Name */}
      <View style={styles.groupInfo}>
        <Image
          source={{ uri: "https://upload.wikimedia.org/wikipedia/commons/f/f1/Andrew_Tate_on_%27Anything_Goes_With_James_English%27_in_2021.jpg" }} // Replace with your group picture URL
          style={styles.groupPicture}
        />
        <TouchableOpacity onPress={updateJoinedGroups}>
  <TextInput
    style={{ marginTop: 15, marginBottom: 15, fontSize: 20, fontWeight: 'bold', color: 'white',}}
    value={editedJoinedGroups}
    onChangeText={setEditedJoinedGroups}
    onBlur={updateJoinedGroups} // Update when input is blurred
  />
</TouchableOpacity>
      </View>

      {/* Buttons */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', padding: 10 }}>
        <TouchableOpacity style={{ alignItems: 'center', marginRight: 50 }}>
          <AntDesign name="addusergroup" size={24} color="white"/>
          <Text style={{ color: 'white' }}>Add</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ alignItems: 'center', marginRight: 50, marginBottom: 20 }}>
          <AntDesign name="search1" size={24} color="white" />
          <Text style={{ color: 'white' }}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ alignItems: 'center' }}>
          <Icon name="meeting-room" size={24} color="white" />
          <Text style={{ color: 'white' }}>Leave</Text>
        </TouchableOpacity>
      </View>

      {/* User List */}
      <FlatList
        data={persons}
        keyExtractor={item => item.id.toString()}
        renderItem={renderUserItem}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  button: {
    marginTop: 30,
  },
  contactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 0.3,
    borderBottomColor: "grey",
  },
  profilePicture: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  contactName: {
    fontSize: 16,
    color: 'white'
  },
  groupInfo: {
    alignItems: 'center',
    padding: 20,
  },
  groupPicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'lightgray',
  },
});

export default GroupChatScreen;
