import { View, Text, FlatList, Image, ScrollView, TouchableOpacity } from "react-native";
import React from "react";
import ImgRenderer from "@/app/AppComponents/Renderers/ImgRenderer";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import HomeHeader from "@/app/AppComponents/Headers/HomeHeader";
import { useGlobalContext } from "@/hooks/global-provider";
import { router, useRouter } from "expo-router";

const Index = () => {
  const { isLoggedIn, refetch, loading, user } = useGlobalContext();
    console.log("user", user);
    const router = useRouter();
  const tickIcon=require("@/assets/images/greenTick.png");
  const data = [
    {
      id: 1,
      title: "Desgi Completetion",
      date: "1 Aug 2021",
      time: "10:00 AM",
      status: "Pending",
      userProfiles: [
        {
          id: 1,
          name: "John Doe",
          image: "https://avatar.iran.liara.run/public",
        },
        {
          id: 2,
          name: "John Doe",
          image: "https://avatar.iran.liara.run/public",
        },
        {
          id: 3,
          name: "John Doe",
          image: "https://avatar.iran.liara.run/public",
        },
        {
          id: 4,
          name: "John Doe",
          image: "https://avatar.iran.liara.run/public",
        },
      ],
    },
    {
      id: 2,
      title: "Desgi Completetion",
      date: "1 Aug 2021",
      time: "10:00 AM",
      status: "Pending",
      userProfiles: [
        {
          id: 1,
          name: "John Doe",
          image: "https://avatar.iran.liara.run/public",
        },
        {
          id: 2,
          name: "John Doe",
          image: "https://avatar.iran.liara.run/public",
        },
        {
          id: 3,
          name: "John Doe",
          image: "https://avatar.iran.liara.run/public",
        },
        {
          id: 4,
          name: "John Doe",
          image: "https://avatar.iran.liara.run/public",
        },
        {
          id: 5,
          name: "John Doe",
          image: "https://avatar.iran.liara.run/public",
        },
      ],
    },
  ];
  const completedTasks = [
    {
      id: 1,
      title: "Desgi Completetion",
      date: "1 Aug 2021",
      time: "10:00 AM",
      status: "Completed",
    },
    {
      id: 2,
      title: "Desgi Completetion",
      date: "1 Aug 2021",
      time: "10:00 AM",
      status: "Completed",
    },
    {
      id: 3,
      title: "Desgi Completetion",
      date: "1 Aug 2021",
      time: "10:00 AM",
      status: "Completed",
    },
  ];
  const inCompleteTasks = [
    {
      id: 1,
      title: "Desgi Completetion",
      date: "1 Aug 2021",
      time: "10:00 AM",
      status: "Pending",
    },
    {
      id: 2,
      title: "Desgi Completetion",
      date: "1 Aug 2021",
      time: "10:00 AM",
      status: "Pending",
    },
    {
      id: 3,
      title: "Desgi Completetion",
      date: "1 Aug 2021",
      time: "10:00 AM",
      status: "Pending",
    },
  ];

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1 }}
    >
       {/* HEADER */}
       <HomeHeader/>
       {/* HEADER */}
      <View className="pt-[18px]">
        <Text className="ml-[18px]  text-[#FFFFFF] font-PoppinsRegular">
          Group tasks
        </Text>
        <FlatList
          nestedScrollEnabled={true}
          className="mt-[13px] ml-[18px]"
          horizontal
          data={data}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <>
              <View className="w-[218px] h-[106px] bg-[#FFFFFF] rounded-lg mr-[15px] pt-[16px] px-[23px]">
                <Text className="font-PoppinsMedium text-[14px] text-[##000000]">
                  {item.title}
                </Text>
                <Text className="font-PoppinsRegular text-[10px]">
                  {item.date} | {item.time}
                </Text>
                <View className="relative mt-[9px]">
                  <ImgRenderer
                    images={item.userProfiles.map((e) => {
                      return e.image;
                    })}
                    limit={4}
                    key={item.id}
                  />
                </View>
              </View>
            </>
          )}
        />
        {/* INCOMPLTED TASKS  */}
        <View className="pt-[18px] px-[18px]">
          <Text className="text-[#FFFFFF] font-PoppinsRegular">
            Incomplete tasks
          </Text>
          {inCompleteTasks.map((item) => (
            <View key={item.id}>
              <View className="w-full py-[12px] px-[25px] bg-[#FFFFFF] rounded-lg mt-[10px] flex-row justify-between items-center">
                <View>
                  <Text className="font-PoppinsMedium text-[14px] text-[#000000]">
                    {item.title}
                  </Text>
                  <Text className="font-PoppinsRegular text-[10px]">
                    {item.date} | {item.time}
                  </Text>
                </View>
                <View>
                  <Ionicons name="chevron-forward" size={16} color="#0EA5E9" />
                </View>
              </View>
            </View>
          ))}
        </View>
        {/* Completed TASKS  */}
        <View className="pt-[18px] px-[18px] pb-[18px]">
          <Text className="text-[#FFFFFF] font-PoppinsRegular">
            Completed tasks
          </Text>

          {completedTasks.map((item) => (
            <View key={item.id}>
              <View className="w-full py-[12px] px-[25px] bg-[#FFFFFF] rounded-lg mt-[10px] flex-row justify-between items-center">
               <View className="flex-row justify-center items-center gap-[6px]">
                <Image className="w-[21px] h-[20px]" source={tickIcon}/>
                <View>
                  <Text className="font-PoppinsMedium text-[14px] text-[#000000]">
                    {item.title}
                  </Text>
                  <Text className="font-PoppinsRegular text-[10px]">
                    {item.date} | {item.time}
                  </Text>
                </View>
               </View>
                <View>
                  <Ionicons name="chevron-forward" size={16} color="#0EA5E9" />
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default Index;
