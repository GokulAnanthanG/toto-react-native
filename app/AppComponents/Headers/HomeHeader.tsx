import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import React from "react";
import { useGlobalContext } from "@/hooks/global-provider";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const HomeHeader = () => {
  const { isLoggedIn, refetch, loading, user } = useGlobalContext();
  console.log("user", user);
  const router = useRouter();

  return (
    <View className="pt-5 px-4 flex-row justify-between items-center bg-transparent">
      <View className="flex-row items-center justify-center gap-[15px]">
        <Image
          className="w-[45px] h-[43px] rounded-full"
          resizeMode="contain"
          source={{ uri: user?.avatar }}
        />
        <View>
          <Text className="font-PoppinsBold text-[#FFFFFF] text-[18px]">
            {user?.name}
          </Text>
          <Text className="font-PoppinsMedium text-[#FFFFFF] text-[14px]">
            {user?.email}
          </Text>
        </View>
      </View>
      <View>
        <TouchableOpacity  onPress={()=>{router.push("/(root)/(tabs)/(index)/Notification/")}}>
      <FontAwesome name={"bell"} size={20} color={"white"} />
      </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeHeader;
