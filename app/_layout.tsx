import { SplashScreen, Stack } from "expo-router";
import "@/global.css";
import Lineargradient from "../component/Lineargradient";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import {  StatusBar } from "react-native";
import { GlobalProvider } from "@/hooks/global-provider";
import { SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
   export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    DarumadropOneRegular: require("@/assets/fonts/DarumadropOne-Regular.ttf"),
    PoppinsBold: require("@/assets/fonts/Poppins-Bold.ttf"),
    PoppinsRegular: require("@/assets/fonts/Poppins-Regular.ttf"),
    PoppinsMedium: require("@/assets/fonts/Poppins-Medium.ttf"),
  });
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  return (
    <>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <Lineargradient
        children={
          <GestureHandlerRootView style={{ flex: 1 }}>
           <GlobalProvider>
            <SafeAreaView style={{ flex: 1 }}>
            <Stack
              screenOptions={{
                contentStyle: { backgroundColor: "transparent" },
                headerShown: false,
                animation: "slide_from_right",
              }}
            /></SafeAreaView>
          </GlobalProvider>
          </GestureHandlerRootView>
         }
      />
    </>
  );
}
