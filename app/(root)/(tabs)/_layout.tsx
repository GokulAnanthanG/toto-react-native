  import HomeHeader from "@/app/AppComponents/Headers/HomeHeader";
import { FontAwesome } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Pressable, Text, View } from "react-native";

type TabIconsProps = {
  focused: boolean;
  icon: any;
};

const TabIcons = ({ focused, icon }: TabIconsProps) => {
  return (
    <View className=" h-full flex flex-col items-center justify-center mt-2">
      <FontAwesome name={icon} size={16} color={focused ? "white" : "grey"} />
    </View>
  );
};

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "transparent",
          elevation: 0, // Removes shadow (Android)
          borderTopWidth: 0, // Removes top border
        },
        tabBarButton: (props) => (
          <Pressable {...props} android_ripple={{ color: "transparent" }} />
        ),
      }}

    >
     <Tabs.Screen
  name="(index)"
  options={{
    sceneStyle: { backgroundColor: "transparent" },
    headerShown:false,    
    tabBarIcon: ({ focused }) => (
      <TabIcons focused={focused} icon="home" />
    ),
  }}
/>

      <Tabs.Screen
        name="List"
        options={{
          sceneStyle: { backgroundColor: "transparent" },
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcons focused={focused} icon="list" />
          ),
        }}
      />
      <Tabs.Screen
        name="Calendar"
        options={{
          sceneStyle: { backgroundColor: "transparent" },
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcons focused={focused} icon="calendar" />
          ),
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          sceneStyle: { backgroundColor: "transparent" },
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcons focused={focused} icon="gear" />
          ),
        }}
      />
    </Tabs>
  );
}
