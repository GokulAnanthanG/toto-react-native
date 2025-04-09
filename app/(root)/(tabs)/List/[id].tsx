import { View, Text, Image, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { Databases } from "react-native-appwrite";
import { database, DB_id, task_collection } from "@/config/appWrite";
import { Task } from "@/interface/listInterface";
import { formatDate, formatTime } from "@/Common/DateTimeFormatter";
const back = require("@/assets/images/angleLeft.png");
const pencil = require("@/assets/images/pencil.png");
const calendar = require("@/assets/images/calendarIcon.png");
const clock = require("@/assets/images/clock.png");
const greenTick = require("@/assets/images/greenTick.png");
const trash = require("@/assets/images/trash.png");
const pin = require("@/assets/images/Pin.png");

const Details = () => {
  const [listData,setData]=useState<Task>();
  const { id} = useLocalSearchParams();
  const fetch = async () => {
    try {
      const response:any = await database.getDocument(DB_id,task_collection,String(id));
       setData(response);
  } catch (error) {
      console.error("Error fetching document:", error);
  }
  }
  useEffect(()=>{
    fetch();
  },[])
   return (
    <View className="px-[34px] pt-[18px]">
      <View className="flex flex-row justify-start items-center gap-[14px]">
        <TouchableOpacity>
          <Image resizeMode="contain" source={back} />
        </TouchableOpacity>
        <Text className="text-[#FFFFFF] font-PoppinsMedium text-[16px]">
         Task Details
        </Text>
      </View>
      <View className="flex flex-row items-center gap-[14px] mt-[76px]">
        <Text className="text-[18px] text-[#FFFFFF] font-PoppinsMedium">
          {listData?.title}
        </Text>
        <Image resizeMode="contain" source={pencil} />
      </View>
      <View className="flex flex-row items-center gap-[4px]">
        <View className="flex flex-row items-center gap-[4px] mt-[8px]">
          <Image resizeMode="contain" source={calendar} />
          <Text className="text-[14px] font-PoppinsRegular text-[#FFFFFF] mt-1">
          {formatDate(listData?.date)} |
          </Text>
        </View>
        <View className="flex flex-row items-center gap-[4px] mt-[8px]">
          <Image resizeMode="contain" source={clock} />
          <Text className="text-[14px] font-PoppinsRegular text-[#FFFFFF] mt-1">
          {formatTime(listData?.time)}
           </Text>
        </View>
      </View>
      {/* HR */}
      <View className="border-b-[0.5px] border-b-[#FFFFFF] mt-[26px]"></View>
      <Text className="text-justify text-[14px] text-[#FFFFFF] font-PoppinsMedium mt-[24.5]">
      {listData?.description}
      </Text>
      {/* ACTIONS */}
      <View className="flex flex-row justify-evenly items-center gap-[35px] mt-[58px]">
        <TouchableOpacity
          className="flex-1 flex flex-col justify-center items-center gap-[10px] bg-[#05243E] h-[71px] rounded-[10px]"
          style={{
            shadowColor: "#FFFFFF",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 8,
            elevation: 7,
          }}
        >
          <Image resizeMode="contain" source={greenTick} />
          <Text className="text-[14px] font-PoppinsMedium text-[#FFFFFF]">
            Done
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 flex flex-col justify-center items-center gap-[10px] bg-[#05243E] h-[71px] rounded-[10px]"
          style={{
            shadowColor: "#FFFFFF",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 8,
            elevation: 7,
          }}
        >
          <Image resizeMode="contain" source={trash} />
          <Text className="text-[14px] font-PoppinsMedium text-[#FFFFFF]">
            Delete
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 flex flex-col justify-center items-center gap-[10px] bg-[#05243E] h-[71px] rounded-[10px]"
          style={{
            shadowColor: "#FFFFFF",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 8,
            elevation: 7,
          }}
        >
          <Image resizeMode="contain" source={pin} />
          <Text className="text-[14px] font-PoppinsMedium text-[#FFFFFF]">
            Pin
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Details;
