import React, { useEffect, useState } from "react";
import {
  Image,
  TextInput,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Animated,
  Alert,
  RefreshControl,
} from "react-native";

import { AntDesign } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import { picURL } from "../auth/supabase.js";
import { gestureHandlerRootHOC } from "react-native-gesture-handler"; //install
import { Swipeable } from "react-native-gesture-handler";
import { supabase } from "../auth/supabase.js";
import { useIsFocused } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { LayoutAnimation } from 'react-native';

const ContactsUI = ({ route }) => {
  const { session } = route.params;
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const isFocused = useIsFocused();
  const fadeAnimation = new Animated.Value(1);
  const [contactOpacities, setContactOpacities] = useState({});
  const [images, setImages] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const groupIds = contacts.map(contact => contact.Group_ID);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchUsers().then(() => setRefreshing(false));
  }, []);

  
  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No messages</Text>
    </View>
  );

  const filteredUsers = users.filter((user) => {
    const nameMatch = user.joinedGroups
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return nameMatch;
  });

  const fetchUsers = async () => {
    const { data: users, error } = await supabase
      .from("Group_Chats")
      .select("*")
      .contains("User_ID", [session.user.id]);
      if(users)
      {
        setContacts(users);
      }

    if (error) {
      console.error(error);
      return;
    }

    const { data, error: sessionError } = await supabase
      .from("UGC")
      .select("name")
      .eq("user_id", session.user.id)
      .single();

    if (sessionError) {
      console.error(sessionError);
      return;
    }

    const sessionusername = data.name;

    const modifiedUsers = await Promise.all(
      users.map(async (user) => {
        const extractedIds = user.User_ID.filter(
          (item) => item !== session.user.id
        );
        const { data, error: sessionError } = await supabase
        .from("UGC")
        .select("name")
        .in("user_id", extractedIds);
        let joinedGroups;
        if(!user.Group_Name)
        {
          const groupNames = data.map(item => item.name);
      
          joinedGroups = groupNames.join(", ");
        }
        else
        {
      
          joinedGroups = user.Group_Name;
        }
        setContactOpacities((prevOpacities) => ({
          ...prevOpacities,
          [user.Group_ID]: new Animated.Value(1),
        }));
        
    
        // Fetch the most recent group chat message
        const { data: recentMessageData, error: messageError } = await supabase
          .from("Group_Chat_Messages")
          .select("*")
          .eq("Group_ID_Sent_To", user.Group_ID)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        const { data: Imagedata, error: ImageError } = await supabase
          .from("images")
          .select("*")
          .in("user_id", extractedIds)
          .eq("image_index", 0);
    
        // Check if recentMessageData exists, and only include users with recent messages
        if (!recentMessageData) {
          return null;
        }
    
        return {
          ...user,
          joinedGroups,
          recentMessage: recentMessageData,
          images: ImageError ? null : Imagedata,
        };
      })
    );
    
    // Filter out null values (users with no recent messages) and sort
    const filteredUsers = modifiedUsers.filter((user) => user !== null);
    
    filteredUsers.sort((a, b) => {
      return (
        new Date(b.recentMessage.created_at) -
        new Date(a.recentMessage.created_at)
      );
    });
    
    setUsers(filteredUsers);
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
      const ampm = hours >= 12 ? "PM" : "AM";
      const formattedTime = `${hours % 12 || 12}:${minutes
        .toString()
        .padStart(2, "0")} ${ampm}`;
      return formattedTime;
    } else {
      // More than a day ago, display the full date
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const formattedDate = `${month.toString().padStart(2, "0")}/${day
        .toString()
        .padStart(2, "0")}/${year}`;
      return formattedDate;
    }
  };

  useEffect(() => {
    fetchUsers();
    const channel = supabase.channel('room1');
    const subscription = channel
      .on('postgres_changes', { event: 'insert', schema: 'public', table: "Group_Chats"}, deletePayload => {
        if (deletePayload) {
          const payloadarray = deletePayload.new.User_ID;
          if (payloadarray.includes(session.user.id)) {
            //console.log("Group data altered");
            fetchUsers();
          }
        }
        // Handle delete event
      })
      .on('postgres_changes', { event: 'update', schema: 'public', table: "Group_Chats"}, updatePayload => {
        if (updatePayload) {
          const payloadarray = updatePayload.new.User_ID;
          if (payloadarray.includes(session.user.id)) {
           // console.log("Group data altered");
            fetchUsers();
          }
        }
        // Handle delete event
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: "Group_Chat_Messages" }, genericPayload => {
        if (genericPayload)
        {
          fetchUsers();
        }
        // Handle generic event
      })
      .subscribe();
  
    // Clean up the subscription when the component unmounts
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleUserCardPress = (user) => {
    setSelectedUser(user);
    //console.log(user.joinedGroups);
    navigation.navigate("Message", { user });
  };

  const handlePlusIconPress = () => {
    // Implement the logic when the plus icon is pressed
    // For example, you can navigate to the compose message screen
    navigation.navigate("ComposeMessage");
  };

  const renderContact = ({ item }) => {
    const handleDelete = async () => {
      try {
        LayoutAnimation.configureNext({
          duration: 200, // Adjust the duration as needed
          update: {
            type: LayoutAnimation.Types.easeInEaseOut,
            property: LayoutAnimation.Properties.opacity,
          },
        });

        // Create a fade-out animation specific to the contact
        const opacityValue = contactOpacities[item.Group_ID];
        Animated.timing(opacityValue, {
          toValue: 0, // Make it fully transparent
          duration: 150, // Animation duration in milliseconds
          useNativeDriver: false, // Required for opacity animations
        }).start(async () => {
          // After the animation is complete, perform the deletion logic
          const { error } = await supabase
            .from("Group_Chat_Messages")
            .delete()
            .eq("Group_ID_Sent_To", item.Group_ID);
  
          if (error) {
            console.error(error);
            return;
          }
  
          // Now delete from the "Group Chats" table
          const { error: groupChatsError } = await supabase
            .from("Group_Chats")
            .delete()
            .eq("Group_ID", item.Group_ID);
  
          if (groupChatsError) {
            console.error(groupChatsError);
          }
  
          // Fetch users again to update the UI
          fetchUsers();
        });
      } catch (error) {
        console.error(error);
      }
    };
    const opacityValue = contactOpacities[item.Group_ID];

    const renderRightActions = (progress, dragX) => {
      // console.log("Progress:", progress);
      const trans = dragX.interpolate({
        inputRange: [-75, 0],
        outputRange: [0, 75], // Modify this line to change the direction of the expansion
      });

      const handleDeleteConfirmation = () => {
        Alert.alert(
          "Delete Contact",
          "Are you sure you want to delete this contact? This will permanently delete all messages for both you and the recipient.",
          [
            {
              text: "Yes",
              onPress: handleDelete,
            },
            {
              text: "No",
            },
          ]
        );
      };

      return (
        <TouchableOpacity onPress={handleDeleteConfirmation}>
          <Animated.View
            style={{
              backgroundColor: "red",
              justifyContent: "center",
              alignItems: "center",
              width: 75,
              height: "100%",
              transform: [{ translateX: trans }],
            }}
          >
            {/* Replace 'Delete' text with trashcan icon */}
            <Icon name="trash" size={24} color="white" />
          </Animated.View>
        </TouchableOpacity>
      );
    };
    const renderProfilePicture = () => {
      if (item.Ammount_Users > 2 && item.images.length > 1) {
        // Overlay two profile pictures
        return (
          <View style={{ position: "relative", paddingVertical: 3 }}>
            <Image
              style={[styles.layeredImage, { zIndex: 1, bottom: 6 }]}
              source={{
                uri: `${picURL}/${item.images[0].user_id}/${item.images[0].user_id}-0-${item.images[0].last_modified}`, // Replace with actual URLs
              }}
            />
            <Image
              style={[
                styles.layeredImage,
                { zIndex: 2, position: "absolute", top: 7, left: 17 },
              ]}
              source={{
                uri: `${picURL}/${item.images[1].user_id}/${item.images[1].user_id}-0-${item.images[1].last_modified}`, // Replace with actual URLs
              }}
            />
          </View>
        );
      }
      if (item.Ammount_Users > 2 && item.images.length > 0 && !item.images[1]) {
        // Overlay two profile pictures
        return (
          <View style={{ position: "relative" }}>
            <Image
              style={[styles.layeredImage, { zIndex: 1, bottom: 6 }]}
              source={{
                uri: "data:image/png;base64,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", // Replace with actual URL
              }}
            />
            <Image
              style={[
                styles.layeredImage,
                { zIndex: 2, position: "absolute", top: 7, left: 17 },
              ]}
              source={{
                uri: `${picURL}/${item.images[0].user_id}/${item.images[0].user_id}-0-${item.images[0].last_modified}`,
              }}
            />
          </View>
        );
      }
      if (item.Ammount_Users > 2 && item.images.length == 0) {
        // Overlay two profile pictures
        return (
          <View style={{ position: "relative" }}>
            <Image
              style={[styles.layeredImage, { zIndex: 1, bottom: 6 }]}
              source={{
                uri: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAALVBMVEX////d3d3a2trk5OTf39/5+fnz8/P8/Pzn5+f29vbw8PDe3t7s7Ozj4+Pt7e3oCmspAAAJJUlEQVR4nO1d24KkKgzsRvGu//+5R6Vttb0hVQGcs/WwDzszaElIQkjC6+UDuS6zquqaHsXwT1dVWalzL88Whs66oq3VgPca5v/aost06Jd0RdkV6ZbYFv3vpEVXhn7de8izgdwltzXPtMgeIrZlc5fdgmUT/VxmiSO7mWWShSZxDJhe3CTLgkJvIlnEJq5dzaP3IVl3oUnN0AWb3odkEYepLFsZfiPHNrywZqkcv5FjGlbrSPMLzbH0wM9wDCOrWnD9bTi2AXSOkP485Fh45lf55TdyrDzy054W4A/F1JuoNiH4jRwbL/x0HYjfgNrDNAabQAPxacw9mogDiqloJCALzW+AEvRxPNvAI8jZxuASOkG1Ivx0aF4rCOjUKJbgDP5iDGwktmCbjUh0zBJcfRONjlmCqW/a0GQOQKOYhmZyiPSvEyRRDLmVuEaNE4x5BgfAsxg7QZhirFp0CUijJqHf3gqJO8EIPZk9uHs33TMI9hQdD+LKpxB03Wno5xDsKbrsF+O29L9wsPxPsBNL3LYZ0e14r3BX2zxIy0xQ9w4ZQ7+uE+4QfIYv84sbvk2A00EG7E8Y82cS7CnaHmk8zVDMsDQZD5XRAXZy+lgZHWAlp8/UoxMs9OkDbf0SFnb/WQ73FpcuuOSuV02Qe4SFfyry9J5UWzRVVpZaD7UlXZG8xXiqc4IF/4EqbXbLDMqOkxa+wWnUhm0phqT0M/1dNm8+yVOLwbUUqrUwwCU/oHdiMaihGfss7Y48kSdBG+IUquJOYk/F5Xg4ibwpvMdvANVKHU4iS5G6ZS0z1+OBOmUpUucINOfx4yvsixBpCoE8V9407k8iZXgsB4SWlrTr2FSUkcFkbFpq2d57MDYVN2OWeyCFUHa2GJR9ISOfjmOUd741Q89wsncTymLc6gPCsKz0ZMosbnQNrmesg5XXoKzFX10DD+p0RnkERo7LT+wU9mfIGa0Ehj8y1aHDkfNZGZuAtfOIigU9tZwQeF8lS6FCStQyE3CFunopUJOK1HjADFfaFNSkIuUPuBe+fC2wl4VMJRJuwGifS6icjGnBQJ9UhiDBVZ59U8hWyNXnwpOYkkaSIvh6NSDDr4LAlqFgiTVspqeFCH2qi6MeDOhKnHQgpJZF63JR93SyiMgw1E3TFqC/rAgfilSXcwTUnTTfH3LjhVs5gLrmY8kQRSPksM0AXbcGHkRYSOGtuVE1yAjijSpQbToOAoxBiHFfASOo0K8kau4NsL3+qEwRn018GaILcfTbkCE8tDYC965DwA3x/Tw0/gMt4jAHgKBLdhn5AmM4pGUA5lDYKTXAXNPBIAJ/Lu7RDAC9mhdmDj0QBPeICmMoGMCYgYUyFKirHsAwh1waDwYfNvl/n6H+HzCEskx8MATXYfmP4fmf+2AI2kOQYfw+Dcowfr8UZRj/3gLVNPHvD3uGUDDLwx4fzJkELX78cZqBISQF0cfaRnUPMYw9XgrvD+OPeSv0I8V+bjE6llgiRuRnT+MUYEs57vNDE03EPFuZjr5fwMnZg8WG4yCSgNOhB1UI5qpGnYthjrnRUhJJhnBm22iwOckAMoBTTM0iAochdBA9AprXNrmVoMkRnEQ8m92oeljYpQjiU/jZ3qE2x7Uq9gqMql0jX3BdnpBNJBR4TXsf+FsBLVKPwaiYnfavcPVopPUWs54nFFfyCVKKEKc4EqHGOca6p/e88yEUisVYu7aMWDMGi67+cMB3PEaVMzXCTypZn8O5lGYDtEJnXheZ2Z8k9fxgUWS1x1h6Ipzu+TWHIq3/xzIQSPBxRzAo8hqcLPU7rZUgrm54rUXXAXnaqKDRyJm3TaxGpnWiw/rTUNtSFlJDA7f3UZuI/54aMYd2DGto8n0ov5+POLTb7b3sLvC/njL3JoT7q5HjVi1fYfOVySJyb7MhcL/39tyP3gFaNbYqp6oFGmDuKAOBpyQW1lFLNPjczzDgN2ftn/MuTknqRup26D1FIHTrilJtt5vPoKtCZPbMU3e1uVyzeaXeSdNlpdZ5PjYSbopUtl/yftxIupO38tIL2jzqIAsm/jvWbHGUIhLZdbHuON7h/JVJPM7y+SOTeLZJ/RuTeJao9Scm8TzO8NwLWGacn6EAjs1o6NK2TTC0bfqGbOZV8N3JOx19lqzkBb1znTWu1ydcHdfeD3/33nUlc8ydu3iu10fu95qj9/Rk04TLmyRt0iZunHmr1kfBRXbn3nOb/CVrB9z+8gMU2jrSb5d4bqds7l8OgCC35GgZAbPh5xQwRKCtZNVyMAvPxsf627zW9Xe3fq0LOcXOJgBcieqN9yJ9KToupOvGSGfOG3DyguPs9O1ersThIUIwCZ1wKKl3UyQPNhlSmZY3cOR03U7L2icYbgnOOFiMt8fZW4oeStVssOd1uSQsbY9qIiG4R9HtVPZ3TUdDcEvRVf+1sRLcUHRO/lwanyiUzIyVunGvgswXBMObiTWWRgPwQeaYRmhDv8XXecZKBSabIVxm6ITW3U4sYZa0YG0TgJqjAA3FmPTohJKl4UeKkWnSAaM25ZgwQzFKXcqy0YZiXNq0YBL83GinYtKnJixFjIYZ00/K48aR16ih30EakWtq1Du9YcV4ox27+McJY4RFCVQEmoHDL8ZW7lN/3PmwklqKbnR0jew2KTC78lruSMFcL1mHmsbSfGKRotwJJngTaBrNBIo2cXgNQWezGv37qeZgRnkIuZtwuEr8mv/cLBA/5kqnHh/2weezAjdiuzxPvIXSF59SBZ/fNDeer6q9ZCqYVH7V+l0XnwNZlUpz/JZi+NdtH1GV5TjxC+MQT/kRSqzJZ/fJFvKb97GEnq7Qlkit+SbRqMR33sfqNb4cW65irdoo+A2YP7WipbiVhRIUjvvIv5VLlDy+OVdPva2Lw8RRfcuX+pnM3F8rz76z1ytpXw6FHfTi1VTauFiQrJlLhXppiEE8f5Alc1Jvz7Ko7N9RV8tCKGVV1hcGS5KGZpfpU6HVWbeu8oqZnkH2k9Q75rcnRdNVWVlqg7LMqqopkjFnffXLF/WKsWCsLNymS6yx/fE7uSHX4dGzbG1rCvrfa++s2oigs7GU8pDo8KO0aLJHklsg10PRaDGUirw/Apq2bVE01YUW+gc7/Ae+CoL+juvgcwAAAABJRU5ErkJggg==", // Replace with actual URL
              }}
            />
            <Image
              style={[
                styles.layeredImage,
                { zIndex: 2, position: "absolute", top: 7, left: 17 },
              ]}
              source={{
                uri: "data:image/png;base64,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", // Replace with actual URL
              }}
            />
          </View>
        );
      }
      if (item.Ammount_Users < 3 && item.images.length == 1) {
        // Single profile picture
        return (
          <Image
            style={styles.profilePicture}
            source={{
              uri: `${picURL}/${item.images[0].user_id}/${item.images[0].user_id}-0-${item.images[0].last_modified}`, // Replace with actual URL
            }}
          />
        );
      } else {
        return (
          <Image
            style={styles.profilePicture}
            source={{
              uri: "data:image/png;base64,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", // Replace with actual URL
            }}
          />
        );
      }
    };
    return (
      <Animated.View style={{ opacity: opacityValue }}>
        <Swipeable
          renderRightActions={renderRightActions}
          overshootRight={false}
          useNativeDriver={true}
        >
          <TouchableOpacity onPress={() => handleUserCardPress(item)}>
            <View style={styles.contactItem}>
              {renderProfilePicture()}
              <View style={styles.contactInfo}>
  <View style={styles.contactNameContainer}>
  <Text
    numberOfLines={1}
    ellipsizeMode="tail"
    style={{
      ...(item.recentMessage && !item.recentMessage.Read.includes(session.user.id)
        ? styles.UnreadcontactName // Apply this style when the condition is true
        : styles.contactName // Apply this style when the condition is false
      ),
    }}
  >
    {item.joinedGroups}
  </Text>

    {item.recentMessage && item.recentMessage.created_at ? (
      <Text style={styles.MessageTime}>
        {formatRecentTime(item.recentMessage.created_at)}
      </Text>
    ) : null}
  </View>
  <View style={styles.recentMessageContainer}>
    {item.recentMessage ? (
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
  <Text
    numberOfLines={1}
    ellipsizeMode="tail"
    style={{
      ...(item.recentMessage && !item.recentMessage.Read.includes(session.user.id)
        ? styles.UnreadRecentMessage // Apply this style when the condition is true
        : styles.RecentMessage // Apply this style when the condition is false
      ),
      width: 265, // Adjust the width as needed
    }}
  >
    {item.recentMessage.Message_Content}
  </Text>
        {item.recentMessage && !item.recentMessage.Read.includes(session.user.id) ? (
          <View style={styles.circle} /> // Add this View for the solid circle
        ) : null}
      </View>
    ) : (
      <Text 
        numberOfLines={1}
        ellipsizeMode='tail'
        style={styles.RecentMessage}
      >
        No messages yet
      </Text>
    )}
  </View>
              </View>
            </View>
          </TouchableOpacity>
        </Swipeable>
      </Animated.View>
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
        <Text style={styles.headerText}>Messages</Text>
        <TouchableOpacity
          onPress={handlePlusIconPress}
          style={{ position: "absolute", top: 10, right: 13 }}
        >
          <AntDesign name="plus" size={25} color="#159e9e" />
        </TouchableOpacity>
      </View>
      <View style={styles.viewContainer}>
        <View style={styles.searchContainer}>
          <AntDesign
            name="search1"
            size={15}
            paddingRight={1}
            color="#575D61"
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Messages"
            placeholderTextColor="#575D61"
            onChangeText={handleSearch}
            value={searchQuery}
            keyboardAppearance="dark"
            returnKeyType="done"
          />
        </View>
      </View>
      <FlatList
          data={filteredUsers}
          renderItem={renderContact}
          keyExtractor={(item) => item.Group_ID.toString()}
          ListEmptyComponent={renderEmptyComponent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      <StatusBar style="light" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1D1D20",
  },
  circle: {
    width: 10, // Adjust the width to your preference
    height: 10, // Adjust the height to your preference
    borderRadius: 5, // Half of the width/height to create a circle
    backgroundColor: '#159e9e', // Change this to your desired circle color
    //alignSelf: 'flex-end', 
    marginRight: 4,// Align the circle to the right of its container
  },
  layeredImage: {
    width: 40, 
    height: 40, 
    marginTop: 5,
    borderRadius: 20,
    marginRight: 25,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    alignContent: "center",
    //borderBottomWidth: 1,
    borderColor: "gray",
    paddingTop: 13,
    paddingBottom: 0,
    paddingLeft: 15,
    paddingRight: 15,
    //marginBottom: 8,
    
  },
  headerText: {
    fontSize: 27,
    fontWeight: "bold",
    //marginTop: -10,
    color: "white",
  },
  logo: {
    //width: 30,
    //height: 30,
    marginRight: 5,
    marginTop: -10,
  },
  viewContainer: {
    backgroundColor: "#1D1D20",
    borderBottomColor: "#2B2D2F",
    //paddingBottom: 3,
    // borderBottomWidth: 0.5,
    // borderBottomColor: "#2B2D2F",
    // borderBottomLeftRadius: 14,
    // borderBottomRightRadius: 14,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2B2D2F",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginTop: 15,
    marginBottom: 5,
    elevation: 3,
    marginHorizontal: 10,
    // borderWidth: 0.20,
    // borderTopWidth: 0.20,
    //borderBottomWidth: 0.2,
    
    borderColor: "grey",
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: "white",
    marginLeft: 5,
    
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "flex-start", 
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1.2,
    borderBottomColor: "#2B2D2F",
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    width: "100%",
  },
  profilePicture: {
    width: 50,
    height: 50,
    borderRadius: 30,
    marginRight: 15,
  },
  contactInfo: {
    flex: 1,
    paddingHorizontal: 5,
  },
  contactName: {
    fontSize: 18,
    fontWeight: "400",
    marginBottom: 5,
    color: "white",
    flexShrink: 1,
  },
  UnreadcontactName: {
    fontSize: 18,
    fontWeight: "400",
    marginBottom: 5,
    color: "white",
    flexShrink: 1,
  },
  MessageTime: {
    fontSize: 14,
    fontWeight: "light",
    color: "white", 
    flexShrink: 0, 
    marginLeft: 10 
  },
  RecentMessage: {
    fontSize: 14,
    fontWeight: "light",
    color: "#cbcace",
  },
  UnreadRecentMessage: {
    fontSize: 14,
    fontWeight: "bold",
    color: "white",
  },
  contactStatus: {
    fontSize: 14,
    color: "#888",
  },
  contactNameContainer: {
    flexDirection: "row",
    paddingRight: 5,
    //flex: 1, 
    justifyContent: "space-between",
  },
  rowBack: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    backgroundColor: "red",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  deleteButton: {
    width: 75,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 140,
  },
  emptyText: {
    fontSize: 20,
    color: "grey",
  },
});

export default gestureHandlerRootHOC(ContactsUI);
