import { supabase } from "./auth/supabase";
import React, { useState, useEffect } from "react";
import { Animated, Easing } from "react-native";

export async function startShakeAnimation(shakeAnimationValue) {
  shakeAnimationValue.setValue(0);
  Animated.sequence([
    Animated.timing(shakeAnimationValue, {
      toValue: 1,
      duration: 100,
      easing: Easing.linear,
      useNativeDriver: true,
    }),
    Animated.timing(shakeAnimationValue, {
      toValue: -1,
      duration: 100,
      easing: Easing.linear,
      useNativeDriver: true,
    }),
    Animated.timing(shakeAnimationValue, {
      toValue: 0,
      duration: 100,
      easing: Easing.linear,
      useNativeDriver: true,
    }),
  ]).start();
}
