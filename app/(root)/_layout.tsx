import Lineargradient from "@/component/Lineargradient";
import { Slot, Stack } from "expo-router";

export default function RootLayout() {
  return  <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "transparent" } }} /> 
}
