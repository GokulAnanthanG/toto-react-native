import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

const _layout = () => {
  return (
   <Stack  screenOptions={{
           contentStyle: { backgroundColor: "transparent" },
           headerShown: false,
           animation: "slide_from_right",
         }}>
         <Stack.Screen name="index" options={{ title: "Home page" }} />
         <Stack.Screen name="Notification" options={{ title: "notification" }} />
       </Stack>
  )
}

export default _layout