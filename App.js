import "react-native-url-polyfill/auto";
import React, { useState, useEffect } from "react";
import { StyleSheet, View, Image } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { supabase } from "./components/auth/supabase.js";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Authentication from "./components/auth/authentication.js";
import Questionaire from "./components/questionairefiles/questionaire.js";
import ThreeMainPages from "./components/miscellaneous/ThreeMainPages.js";
import LoadingScreen from "./components/miscellaneous/loadingScreen";

const PERSISTENCE_KEY = "NAVIGATION_STATE";

const Stack = createStackNavigator(); // Creating a stack is important for navigation. Must initialize the stack with creatStackNavigator().

const App = () => {
  const [session, setSession] = useState(null);
  const [hasProfile, setHasProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [homepageVisited, setHomepageVisited] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [initialState, setInitialState] = useState();
  const logo = require("./assets/logo4.png");
  const [profileInserted, setProfileInserted] = useState(null);
  const [ugcInserted, setUgcInserted] = useState(null);

  useEffect(() => {
    let unsubscribe;

    // Function to handle connectivity changes
    const handleConnectivityChange = (state) => {
      //alert(state.isConnected);
      // Check the connectivity status
      /*if (state.isConnected == false) {
        setHasProfile(true);
      }*/

      setConnected(false);
    };

    // Set up the event listener
    (async () => {
      unsubscribe = NetInfo.addEventListener(handleConnectivityChange);

      // Fetch initial connectivity state
      const state = await NetInfo.fetch();
      handleConnectivityChange(state);
    })();

    setConnected();

    // Clean up the event listener on component unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        checkUserProfile(session);
      } else {
        setSession(false);
        setIsLoading(false); // If there is no session, we stop loading and allow the Authentication component to render
      }
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        checkUserProfile(session);
      } else {
        setSession(false);
        setIsLoading(false); // If there is no session, we stop loading and allow the Authentication component to render
      }
    });
  }, []);

  const checkUserProfile = async (session) => {
    //const { error } = await supabase.auth.signOut();
    if (session?.user) {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("profile")
        .select("profile_complete")
        .eq("user_id", session.user.id);

      const { data: ugcData, error: ugcError } = await supabase
        .from("UGC")
        .select("has_ugc")
        .eq("user_id", session.user.id);

      if (error || ugcError) {
        alert(error.message);
      }

      if (data == null) {
        // User does not have a profile, insert a new profile
        const { data: profileInsertData, error: profileInsertError } =
          await supabase
            .from("profile")
            .insert([{ user_id: session.user.id, profile_complete: false }]);
        if (profileInsertError) {
          alert("Please try again later");
        } else {
          setProfileInserted(true);
        }
      }
      if (ugcData == null) {
        const { data: ugcInsertData, error: ugcInsertError } = await supabase
          .from("UGC")
          .insert([{ user_id: session.user.id }]);

        if (ugcInsertError) {
          alert("Please try again later");
        } else {
          setUgcInserted(true);
        }
      }

      if (
        (data.profile_complete == true && ugcData.has_ugc == true) ||
        (ugcInserted == true && profileInserted == true)
      ) {
        const hasProfile = !!data.profile_complete;

        setHasProfile(true);
        setIsLoading(false);
      } else {
        //console.log("profile invalid");
        setHasProfile(false);
        setIsLoading(false);
      }
    }

    setIsLoading(false);
  };

  if (isLoading) {
    // Render a loading state or splash screen
    return (
      <View style={styles.container}>
        <Image source={logo} style={styles.headerImage} alt="Logo " />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session && session.user ? (
          hasProfile === false ? (
            // If hasProfile is explicitly false, navigate to the Questionaire
            <Stack.Screen
              key={session?.user?.id ?? "TagSelectionScreen"}
              name="questionaire"
              component={Questionaire}
              initialParams={{ session }}
            />
          ) : hasProfile === true ? (
            // If hasProfile is true, navigate to the ThreeMainPages
            <Stack.Screen
              key={session?.user?.id ?? "ThreeMainPages"}
              name="ThreeMainPages"
              component={ThreeMainPages}
              initialParams={{ session }}
            />
          ) : (
            // If hasProfile is null, you should render a loading indicator here
            // You can create a dedicated loading screen or inline a loading indicator component
            <Stack.Screen
              name="LoadingScreen"
              component={LoadingScreen} // Replace this with your loading component/screen
            />
          )
        ) : (
          // If there is no session, navigate to the Authentication screen
          <Stack.Screen name="Authentication" component={Authentication} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: "center",
    justifyContent: "center",
    justifySelf: "center",
    backgroundColor: "#111111",
    width: "100%",
  },
  headerImage: {
    width: 90,
    height: 90,
    alignSelf: "center",
    marginBottom: 25,
  },
});

export default App;
