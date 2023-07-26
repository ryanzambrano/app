import React, { useEffect, useState } from "react";
import {
  Image,
  TextInput,
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from "react-native";

import { useNavigation } from "@react-navigation/native";
import { picURL } from "../auth/supabase.js";
import { decode } from "base64-arraybuffer";
import { createClient } from "@supabase/supabase-js";
import { Button } from "react-native-paper";


const supabaseUrl = "https://jaupbyhwvfulpvkfxmgm.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphdXBieWh3dmZ1bHB2a2Z4bWdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY4NDYwMzgzNSwiZXhwIjoyMDAwMTc5ODM1fQ.Jr5Q7WBvMDpFgZ9FOJ1vw71P8gEeVqNaN2S8AfqTRrM";
const supabase = createClient(supabaseUrl, supabaseKey);

const ContactsUI = ({ route }) => {
  const { session } = route.params;
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const filteredUsers = users.filter((user) => {
    const nameMatch = user.name.toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch;
  });

  const fetchUsers = async () => {
    const { data: users, error } = await supabase.from("UGC").select("*");
    if (error) {
      console.error(error);
      return;
    }

    const recentMessagesPromises = users.map(async (user) => {
      const { data: messages, error: messageError } = await supabase
        .from("Message")
        .select("Content, createdat")
        .or(
          `and(Sent_From.eq.${session.user.id},Contact_ID.eq.${user.user_id}),and(Contact_ID.eq.${session.user.id},Sent_From.eq.${user.user_id})`
        )
        .order("createdat", { ascending: false })
        .limit(1);
  
      if (messageError) {
        console.error(messageError);
        return { ...user, recentMessage: "Error fetching message", recentTime: null };
      }
  
      const recentMessage = messages.length > 0 ? messages[0].Content : "No recent messages";
      const RTime = messages.length > 0 ? messages[0].createdat : null;
      const recentTime = formatRecentTime(RTime);
      return { ...user, recentMessage, recentTime };
    });
  
    const usersWithRecentMessages = await Promise.all(recentMessagesPromises);
    setUsers(usersWithRecentMessages);
  };

  const formatRecentTime = (timestamp) => {
    if (!timestamp) return "";
  
    const date = new Date(timestamp);
    const currentTime = new Date();
    const diffInMs = currentTime - date;
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
  
    if (diffInDays < 1) {
      // Less than a day ago, display time in AM/PM format
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedTime = `${hours % 12 || 12}:${minutes.toString().padStart(2, "0")} ${ampm}`;
      return formattedTime;
    } else {
      // More than a day ago, display the full date
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const formattedDate = `${month.toString().padStart(2, "0")}/${day.toString().padStart(2, "0")}/${year}`;
      return formattedDate;
    }
  };


  useEffect(() => {
    fetchUsers();
    const channel = supabase
      .channel("custom-all-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Message", /*filter: `.or(Sent_From.eq.${session.user.id}, Contact_ID.eq.${session.user.id})`, */},
        (payload) => {
          fetchUsers();
        }
      )
      .subscribe();
      return () => {
        supabase.removeChannel(channel);
      }
      
  }, []);
  

  const handleUserCardPress = (user) => {
    setSelectedUser(user);

    navigation.navigate("Message", {
      contactName: user.name,
      contactId: user.user_id,
      myId: session.user.id,
      contactImage: `${picURL}/${user.user_id}/${user.user_id}-0?${new Date().getTime()}`
    });
  };



  const renderContact = ({ item }) => {
    return (
      <TouchableOpacity onPress={() => handleUserCardPress(item)}>
        <View style={styles.contactItem}>
          <Image
            style={styles.profilePicture}
            source={{
              uri: `${picURL}/${item.user_id}/${item.user_id}-0?${new Date().getTime()}`
            }}
          />
          <View style={styles.contactInfo}>
            <View style={styles.contactNameContainer}>
              <Text style={styles.contactName}>{item.name}</Text>
              <Text style={styles.MessageTime}>{item.recentTime}</Text>
            </View>
            <Text style={styles.RecentMessage}>{item.recentMessage}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image
          style={styles.logo}
          source={{
            uri: "https://static.vecteezy.com/system/resources/previews/002/927/317/large_2x/tourist-hammock-for-recreation-portable-hammock-isolated-on-a-white-background-illustration-in-doodle-style-hammock-for-outdoor-recreation-free-vector.jpg",
          }}
        />
        <Text style={styles.headerText}>Cabana</Text>
      </View>
      <View style={styles.viewContainer}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="🔎 Search by name"
            onChangeText={handleSearch}
            value={searchQuery}
          />
        </View>
        <FlatList
          data={filteredUsers}
          renderItem={renderContact}
          keyExtractor={(item) => item.id.toString()}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    alignContent: "center",
    //borderBottomWidth: 1,
    borderColor: "gray",
    paddingTop: 13,
    paddingBottom: 6,
    paddingLeft: 15,
    paddingRight: 15,
    //marginBottom: 8,
  },
  headerText: {
    fontSize: 25,
    fontWeight: "bold",
    marginTop: -10,
  },
  logo: {
    width: 30,
    height: 30,
    marginRight: 5,
    marginTop: -10,
  },
  viewContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginTop: 5,
    marginBottom: 1,
    elevation: 3,
    marginHorizontal: 5,
    borderWidth: 0.3,
    borderColor: 'grey',
  },

  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "flex-start", // Align elements at the top of the container
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#DDD",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  profilePicture: {
    width: 50,
    height: 50,
    borderRadius: 30,
    marginRight: 15,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  MessageTime: {
    fontSize: 14,
    fontWeight: "light",
    color: "gray", // Add the color for the recent time (optional)
  },
  RecentMessage: {
    fontSize: 14,
    fontWeight: "light",
  },
  contactStatus: {
    fontSize: 14,
    color: "#888",
  },
  contactNameContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
});

export default ContactsUI;
