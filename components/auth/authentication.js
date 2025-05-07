import "react-native-url-polyfill/auto";
import React from "react";
import SignIn from "./signIn.js";
import SignUp from "./signUp.js";
import ForgotPassword from "./forgotPassword.js";
import PrivacyPolicy from "../miscellaneous/privacyPolicy.js";
import UserAgreement from "../miscellaneous/userAgreement.js";

import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator();

const Authentication = ({ navigation }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SignIn" component={SignIn} />
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicy}
        //initialParams={session}
      />
      <Stack.Screen
        name="UserAgreement"
        component={UserAgreement}
        //initialParams={session}
      />
    </Stack.Navigator>
  );
};

export default Authentication;
