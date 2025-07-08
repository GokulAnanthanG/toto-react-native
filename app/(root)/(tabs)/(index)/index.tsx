import {
  View,
  Text,
  FlatList,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import ImgRenderer from "@/app/AppComponents/Renderers/ImgRenderer";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import HomeHeader from "@/app/AppComponents/Headers/HomeHeader";
import { useGlobalContext } from "@/hooks/global-provider";
import { router, useRouter } from "expo-router";
import {
  database,
  DB_id,
  groupTask_collection,
  groupTaskAddPermission_collection,
  task_collection,
  usersCollection,
} from "@/config/appWrite";
import { Models, Query } from "react-native-appwrite";
import { Task } from "@/interface/listInterface";
import { formatDate, formatTime } from "@/Common/DateTimeFormatter";
import { GroupTaskT } from "@/interface/GroupTaskT";
import { GroupTaskWithDetails } from "@/interface/GroupTaskWithDetailsT";
import { UserData } from "@/interface/UserInterface";

const Index = () => {
  const { isLoggedIn, refetch, loading, user } = useGlobalContext();
  const [completedTasks, setCompletedTasks] = useState<Task[]>();
  const [inCompleteTasks, setInCompleteTasks] = useState<Task[]>();
  const [groupTasks, setGroupTasks] = useState<GroupTaskWithDetails[]>();
  const router = useRouter();
  const tickIcon = require("@/assets/images/greenTick.png");
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
  const [isGroupTaskLoading, setIsGroupTaskLoading] = useState<boolean>(false);
  const [isCompletedTaskLoading, setIsCompletedTaskLoading] =
    useState<boolean>(false);
  const [isIncompletedTaskLoading, setIsIncompletedTaskLoading] =
    useState<boolean>(false);
  const getGroupTask = async () => {
    try {
      setIsGroupTaskLoading(true);
      const result = await database.listDocuments(DB_id, groupTask_collection, [
        Query.limit(3),
        Query.orderAsc("$createdAt"),
        Query.or([
          Query.equal("owner", user?.$id!),
          Query.contains("members", user?.$id!),
        ]),
      ]);
      console.log("result_", result);
      const data = await Promise.all(
        result?.documents?.map(async (task: Models.Document) => {
          const groupTask = task as unknown as GroupTaskT;
          return {
            ...groupTask,
            members: await Promise.all(
              groupTask.members.map(async (m: string) => {
                const result = await database.listDocuments(
                  DB_id,
                  usersCollection,
                  [Query.equal("userId", m)]
                );
                return result.documents;
              })
            ),
            ownerDetails: await database.listDocuments(DB_id, usersCollection, [
              Query.equal("userId", groupTask.owner),
            ]),
          };
        })
      );
      console.log("GroupData2", data[0].members);

      setGroupTasks(data! as GroupTaskWithDetails[]);
    } catch (err) {
      console.log("Error fetching group tasks:", err);
      Alert.alert("Error", "Failed to fetch group tasks");
    } finally {
      setIsGroupTaskLoading(false);
    }
  };
  const getIncompletedTask = async () => {
    try {
      setIsIncompletedTaskLoading(true);
      const result = await database.listDocuments(DB_id, task_collection, [
        Query.limit(3),
        Query.orderAsc("$createdAt"),
        Query.equal("userId", user?.$id!),
        Query.equal("isCompleted", false),
      ]);
      console.log("INCOMPLETED", result);
      setInCompleteTasks(result.documents as Task[]);
    } catch (err) {
      console.log("Error fetching incompleted tasks:", err);
      Alert.alert("Error", "Failed to fetch incompleted tasks");
    } finally {
      setIsIncompletedTaskLoading(false);
    }
  };
  const getCompletedTask = async () => {
    try {
      setIsCompletedTaskLoading(true);
      const result = await database.listDocuments(DB_id, task_collection, [
        Query.limit(3),
        Query.orderAsc("$createdAt"),
        Query.equal("userId", user?.$id!),
        Query.equal("isCompleted", true),
      ]);
      setCompletedTasks(result.documents as Task[]);
    } catch (err) {
      console.log("Error fetching completed tasks:", err);
      Alert.alert("Error", "Failed to fetch completed tasks");
    } finally {
      setIsCompletedTaskLoading(false);
    }
  };
  useEffect(() => {
    getIncompletedTask();
    getCompletedTask();
    getGroupTask();
  }, []);
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      {/* HEADER */}
      <HomeHeader />
      {/* HEADER */}
      <View className="pt-[18px]">
        <Text className="ml-[18px]  text-[#FFFFFF] font-PoppinsRegular">
          Group tasks
        </Text>
        <FlatList
          nestedScrollEnabled={true}
          className="mt-[13px] ml-[18px]"
          horizontal
          data={groupTasks}
          keyExtractor={(item) => item.$id.toString()}
          renderItem={({ item }) => (
            <>
              <TouchableOpacity
                onPress={() => router.push(`/List/Group/${item.$id}`)}
                className="w-[218px] h-[106px] bg-[#FFFFFF] rounded-lg mr-[15px] pt-[16px] px-[23px]"
              >
                <Text className="font-PoppinsMedium text-[14px] text-[##000000]">
                  {item.title}
                </Text>
                <Text className="font-PoppinsRegular text-[10px]">
                  {formatDate(item.date)} | {formatTime(item.time)}
                </Text>
                <View className="relative mt-[9px]">
                  <ImgRenderer
                    images={item.members[0]?.map((e: any) => {
                      return e.avatar;
                    })}
                    limit={4}
                    key={item.$id}
                  />
                </View>
              </TouchableOpacity>
            </>
          )}
        />
        {isGroupTaskLoading && (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#FFFFFF" />
          </View>
        )}
        {/* INCOMPLTED TASKS  */}
        <View className="pt-[18px] px-[18px]">
          <Text className="text-[#FFFFFF] font-PoppinsRegular">
            Incomplete tasks
          </Text>
          {inCompleteTasks?.map((item: Task) => (
            <TouchableOpacity
              key={item.$id}
              onPress={() => router.push(`/List/${item.$id}`)}
            >
              <View className="w-full py-[12px] px-[25px] bg-[#FFFFFF] rounded-lg mt-[10px] flex-row justify-between items-center">
                <View>
                  <Text className="font-PoppinsMedium text-[14px] text-[#000000]">
                    {item.title}
                  </Text>
                  <Text className="font-PoppinsRegular text-[10px]">
                    {formatDate(item.date)} | {formatTime(item.time)}
                  </Text>
                </View>
                <View>
                  <Ionicons name="chevron-forward" size={16} color="#0EA5E9" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
          {inCompleteTasks?.length === 0 && (
            <View className="flex-1 items-center justify-center mt-[18px]">
              <Text className="text-[#FFFFFF] font-PoppinsRegular">
                No incomplete tasks
              </Text>
            </View>
          )}
          {isIncompletedTaskLoading && (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#FFFFFF" />
            </View>
          )}
        </View>
        {/* Completed TASKS  */}
        <View className="pt-[18px] px-[18px] pb-[18px]">
          <Text className="text-[#FFFFFF] font-PoppinsRegular">
            Completed tasks
          </Text>

          {completedTasks?.map((item: Task) => (
            <TouchableOpacity
              key={item.$id}
              onPress={() => router.push(`/List/${item.$id}`)}
            >
              <View className="w-full py-[12px] px-[25px] bg-[#FFFFFF] rounded-lg mt-[10px] flex-row justify-between items-center">
                <View className="flex-row justify-center items-center gap-[6px]">
                  <Image className="w-[21px] h-[20px]" source={tickIcon} />
                  <View>
                    <Text className="font-PoppinsMedium text-[14px] text-[#000000]">
                      {item.title}
                    </Text>
                    <Text className="font-PoppinsRegular text-[10px]">
                      {formatDate(item.date)} | {formatTime(item.time)}
                    </Text>
                  </View>
                </View>
                <View>
                  <Ionicons name="chevron-forward" size={16} color="#0EA5E9" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
          {completedTasks?.length === 0 && (
            <View className="flex-1 items-center justify-center mt-[18px]">
              <Text className="text-[#FFFFFF] font-PoppinsRegular">
                No completed tasks
              </Text>
            </View>
          )}
          {isCompletedTaskLoading && (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#FFFFFF" />
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default Index;
