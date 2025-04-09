import { NotificationType } from "@/enum/NotificationTypeEnum";
import { router, Slot, Stack } from "expo-router";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
const back = require("@/assets/images/angleLeft.png");
const Layout = () => {
    const [selectedType,setSelectedType]=useState(NotificationType.Reminder);
  return (
    <View className="px-[23px]">
      <View className="flex flex-row items-center  mt-[35px] gap-[10px]">
        <TouchableOpacity
          onPress={() => {
            router.back();
          }}
          className="w-[25px] h-[25px] bg-[#FFFFFF] rounded-full flex justify-center items-center"
        >
          <Image
            className="w-[10px] h-[10px]"
            resizeMode="contain"
            source={back}
          />
        </TouchableOpacity>
        <Text className="font-PoppinsMedium text-[15px] text-[#FFFFFF]">
          Notifications
        </Text>
      </View>
      <Text className="mt-1 ml-8 text-gray-300">
        Notification of group task add permission, pending task alert, group
        pending task reminder.
      </Text>

      <View className="px-[18px] pt-[15px]">
        <View className="flex flex-row justify-evenly">
          <TouchableOpacity onPress={()=>{setSelectedType(NotificationType.Reminder); router.replace("/(root)/(tabs)/(index)/Notification")}} className={`w-auto border rounded-md border-gray-400 p-1.5 ${selectedType==NotificationType.Reminder?"border-white":""}`}>
            <Text className={`text-center  text-[11px] ${selectedType==NotificationType.Reminder?"text-white":" text-gray-400"}`}>
              Reminder
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>{setSelectedType(NotificationType.Tasks);router.replace("/Notification/Tasks")}} className={`w-auto border rounded-md border-gray-400 p-1.5 ${selectedType==NotificationType.Tasks?"border-white":""}`}>
            <Text className={`text-center  text-[11px] ${selectedType==NotificationType.Tasks?"text-white":" text-gray-400"}`}>
              Tasks
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>{setSelectedType(NotificationType.GroupTasks);router.replace("/Notification/GroupTasks")}} className={`w-auto border rounded-md border-gray-400 p-1.5 ${selectedType==NotificationType.GroupTasks?"border-white":""}`}>
            <Text className={`text-center  text-[11px] ${selectedType==NotificationType.GroupTasks?"text-white":" text-gray-400"}`}>
              Group Tasks
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>{setSelectedType(NotificationType.Permission);router.replace("/Notification/Permission")}} className={`w-auto border rounded-md border-gray-400 p-1.5 ${selectedType==NotificationType.Permission?"border-white":""}`}>
            <Text className={`text-center  text-[11px] ${selectedType==NotificationType.Permission?"text-white":" text-gray-400"}`}>
              Permission
            </Text>
          </TouchableOpacity>
        </View>
        <Slot />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({});

export default Layout;
