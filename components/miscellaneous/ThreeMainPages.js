import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

// Page Imports
import MessagingUI from "../contactstab/messages";
import ComposeMessageScreen from "../contactstab/Compose";
import AddPerson from "../contactstab/AddPerson";
import TabNavigator from "./TabNavigator";
import ProfileUI from "../contactstab/otherprofile";
import UserCard from "../hometab/userCard.js";
import SettingsScreen from "./settings";
import AddProfileImages from "../profiletab/addProfileImages";
import EditProfileScreen from "../profiletab/editProfile";
import { AddPrompts } from "../profiletab/addPrompts";
import TagSelectionEdit from "../profiletab/TagSelectionEdit";
import FiltersUI from "../hometab/filters.js";
import GroupChatScreen from "../contactstab/otherprofile";
import { QuestionaireAnswers } from "../hometab/questionaireAnswers";
import Retake from "../retakeQuestionaireFiles/retake.js";
import Questionaire from "../questionairefiles/questionaire.js";
import BlockedList from "./blockedList";
import ReportUI from "../hometab/report";

const Stack = createStackNavigator(); // Initialize stack navigator

const ThreeMainPages = ({ route }) => {
  const { session } = route.params;
  return (
    // Independent (below) must be true as the app.js stack navigator directs to here. Nested navigators causes problems, so this must be clarified.
    <NavigationContainer independent={true} style={{ marginBottom: -20 }}>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        style={{ marginBottom: -20 }}
      >
        <Stack.Screen
          name="Tabs"
          component={TabNavigator}
          initialParams={{ session }} // All of these Stack.Screen components make up the main home pages and each of three main pages' child pages.
        />
        <Stack.Screen // While TabNavigator holds the navigation container for the bottom tab that allows navigation between the three major home pages,
          name="userCard" // Everything else below must be put in order to allow navigation from those three main pages to their sister pages (ex. Home to userCard)
          component={UserCard}
          initialParams={{ session }}
        />
        <Stack.Screen
          name="Message"
          component={MessagingUI}
          initialParams={{ session }}
        />
        <Stack.Screen
          name="AddProfileImages"
          component={AddProfileImages}
          initialParams={{ session }}
        />
        <Stack.Screen
          name="SettingsScreen"
          component={SettingsScreen}
          initialParams={{ session }}
        />
        <Stack.Screen
          name="EditProfileScreen"
          component={EditProfileScreen}
          initialParams={{ session }}
        />

        <Stack.Screen
          name="TagSelectionEdit"
          component={TagSelectionEdit}
          initialParams={{ session }}
        />
        <Stack.Screen
          name="AddPrompts"
          component={AddPrompts}
          initialParams={{ session }}
        />
        <Stack.Screen
          name="ComposeMessage"
          mode="modal"
          component={ComposeMessageScreen}
          initialParams={{ session }}
          options={{ presentation: "modal" }}
        />
        <Stack.Screen
          name="Filters"
          mode="modal"
          component={FiltersUI}
          initialParams={{ session }}
          options={{ presentation: "modal" }}
        />

        <Stack.Screen
          name="QuestionaireAnswers"
          component={QuestionaireAnswers}
          initialParams={{ session }}
        />
        <Stack.Screen
          name="Questionaire"
          component={Questionaire}
          initialParams={{ session }}
        />
        <Stack.Screen
          name="Retake"
          component={Retake}
          initialParams={{ session }}
        />
        <Stack.Screen
          name="GroupChatScreen"
          component={GroupChatScreen}
          initialParams={{ session }}
        />
        <Stack.Screen
          name="AddPerson"
          mode="modal"
          component={AddPerson}
          initialParams={{ session }}
          options={{ presentation: "modal" }}
        />
        <Stack.Screen
          name="BlockedList"
          component={BlockedList}
          initialParams={{ session }}
        />
        <Stack.Screen
          name="ReportUI"
          component={ReportUI}
          initialParams={{session}}
          options={{ presentation: "modal" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default ThreeMainPages;
