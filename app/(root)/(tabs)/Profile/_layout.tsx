import { Stack } from "expo-router";

export default function ListLayout() {
  return (
    <Stack  screenOptions={{
        contentStyle: { backgroundColor: "transparent" },
        headerShown: false,
        animation: "slide_from_right",
      }}>
      <Stack.Screen name="index" options={{ title: "profile" }} />
      <Stack.Screen name="details" options={{ title: "Details Page" }} />
    </Stack>
  );
}
