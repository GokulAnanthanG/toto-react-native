import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import { router } from "expo-router";
const back = require("@/assets/images/angleLeft.png");
const right = require("@/assets/images/angleRight.png");
const user = require("@/assets/images/user.png");
const request = require("@/assets/images/request.png");
const terms = require("@/assets/images/terms.png");
const project = require("@/assets/images/project.png");

const Profile = () => {
  return (
    <View>
      <View className="flex flex-row px-[23px] mt-[35px] gap-[91px]">
        <TouchableOpacity  onPress={() => {
          router.back();
        }}  className="w-[30px] h-[30px] bg-[#FFFFFF] rounded-full flex justify-center items-center">
          <Image resizeMode="contain" source={back} />
        </TouchableOpacity>
        <Text className="font-PoppinsMedium text-[25px] text-[#FFFFFF]">
          Settings
        </Text>
      </View>
      {/* OPTIONS */}
      <View className="flex flex-row justify-between items-center px-[17px] pb-[17px] border-b border-[#D9D9D9]  mt-[118px]">
        <View className="flex flex-row gap-[20px]">
          <Image resizeMode="contain" source={user} />
          <Text className="text-[18px] font-PoppinsRegular text-[#FFFFFF]">
            Profile
          </Text>
        </View>
        <View>
          <Image resizeMode="contain" source={right} />
        </View>
      </View>
      {/* OPTIONS */}
      <TouchableOpacity
        onPress={() => {
          router.push(`/Profile/Request`);
        }}
        className="flex flex-row justify-between items-center px-[17px] pb-[17px] border-b border-[#D9D9D9]  mt-[21px]"
      >
        <View className="flex flex-row gap-[20px]">
          <Image resizeMode="contain" source={request} />
          <Text className="text-[18px] font-PoppinsRegular text-[#FFFFFF]">
            Request
          </Text>
        </View>
        <View>
          <Image resizeMode="contain" source={right} />
        </View>
      </TouchableOpacity>
      {/* OPTIONS */}
      <View className="flex flex-row justify-between items-center px-[17px] pb-[17px] border-b border-[#D9D9D9]  mt-[21px]">
        <View className="flex flex-row gap-[20px]">
          <Image resizeMode="contain" source={project} />
          <Text className="text-[18px] font-PoppinsRegular text-[#FFFFFF]">
            Projects
          </Text>
        </View>
        <View>
          <Image resizeMode="contain" source={right} />
        </View>
      </View>
      {/* OPTIONS */}
      <View className="flex flex-row justify-between items-center px-[17px] pb-[17px] border-b border-[#D9D9D9]  mt-[21px]">
        <View className="flex flex-row gap-[20px]">
          <Image resizeMode="contain" source={terms} />
          <Text className="text-[18px] font-PoppinsRegular text-[#FFFFFF]">
            Terms and Policies
          </Text>
        </View>
        <View>
          <Image resizeMode="contain" source={right} />
        </View>
      </View>
    </View>
  );
};

export default Profile;
