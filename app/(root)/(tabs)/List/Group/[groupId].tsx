import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from "react-native";
import React, { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Databases, Query } from "react-native-appwrite";
import {
  database,
  DB_id,
  groupTask_collection,
  usersCollection,
} from "@/config/appWrite";
import { Task } from "@/interface/listInterface";
import { formatDate, formatTime } from "@/Common/DateTimeFormatter";
import { useGlobalContext } from "@/hooks/global-provider";
import { GroupTaskViewT } from "@/interface/GroupTaskViewT";
import { DBUserData } from "@/interface/UserInterface";
import { Ionicons } from "@expo/vector-icons";
const back = require("@/assets/images/angleLeft.png");
const pencil = require("@/assets/images/pencil.png");
const calendar = require("@/assets/images/calendarIcon.png");
const clock = require("@/assets/images/clock.png");
const greenTick = require("@/assets/images/greenTick.png");
const trash = require("@/assets/images/trash.png");
const pin = require("@/assets/images/Pin.png");

const GroupTaskScreen = () => {
  const { isLoggedIn, refetch, loading, user } = useGlobalContext();
  console.log("user data", user?.$id);

  const [listData, setData] = useState<GroupTaskViewT>();
  const { groupId } = useLocalSearchParams();
  const [isLoading, setLoading] = useState<boolean>(false);
  const [comment, setComment] = useState<string>("");
  const fetch = async () => {
    try {
      setLoading(true);
      const response: any = await database.getDocument(
        DB_id,
        groupTask_collection,
        String(groupId)
      );

      const members: any = await Promise.all(
        response.members.map(async (m: any) => {
          console.log("MEMBER ID", m);
          let result = await database.listDocuments(DB_id, usersCollection, [
            Query.equal("userId", m),
          ]);
          return result.documents;
        })
      );
      console.log("members", members[0]);

      const ownerDetail: any = await database.listDocuments(
        DB_id,
        usersCollection,
        [Query.equal("userId", response.owner)]
      );
      console.log("TTT", {
        ...response,
        members: members[0],
        ownerDetail: ownerDetail?.documents[0],
      });

      setData({
        ...response,
        members: members[0],
        ownerDetail: ownerDetail?.documents[0],
      });
    } catch (error) {
      console.error("Error fetching document:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetch();
  }, []);

  const updateTaskStatus = async () => {
    try {
      setLoading(true);
      const response = await database.updateDocument(
        DB_id,
        groupTask_collection,
        String(groupId),
        {
          isCompleted: !listData?.isCompleted,
        }
      );
      fetch();
    } catch (error) {
      console.error("Error updating task status:", error);
      Alert.alert("Failed to update task status");
    } finally {
      setLoading(false);
    }
  };
  const showConfirmationAlert = (msg: string) => {
    Alert.alert(
      "Confirm to submit",
      msg,
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          onPress: () => updateTaskStatus(),
        },
      ],
      { cancelable: true }
    );
  };
  const deleteTask = async () => {
    try {
      setLoading(true);
      await database.deleteDocument(
        DB_id,
        groupTask_collection,
        String(groupId)
      );
      router.back();
    } catch (error) {
      console.error("Error deleting task:", error);
      Alert.alert("Failed to delete task");
    } finally {
      setLoading(false);
    }
  };

  const showDeleteConfirmation = () => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this task?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          onPress: () => deleteTask(),
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };
  const updatePinStatus = async () => {
    try {
      setLoading(true);
      const response = await database.updateDocument(
        DB_id,
        groupTask_collection,
        String(groupId),
        {
          pinned: !listData?.pinned,
        }
      );
      fetch();
    } catch (error) {
      console.error("Error updating pin status:", error);
      Alert.alert("Failed to update pin status");
    } finally {
      setLoading(false);
    }
  };
  return (
    <View className="px-[34px] pt-[18px]">
      <View className="flex flex-row justify-start items-center gap-[14px]">
        <TouchableOpacity onPress={() => router.back()}>
          <Image resizeMode="contain" source={back} />
        </TouchableOpacity>
        <Text className="text-[#FFFFFF] font-PoppinsMedium text-[16px]">
          Task Details
        </Text>
      </View>
      {isLoading ? (
        <View>
          <ActivityIndicator />
        </View>
      ) : (
        <>
          <View className="flex flex-row items-center gap-[14px] mt-[76px]">
            <Text className="text-[18px] text-[#FFFFFF] font-PoppinsMedium">
              {listData?.title}
            </Text>
            <Image resizeMode="contain" source={pencil} />
          </View>

          <Text className="text-[14px] font-PoppinsRegular text-[#FFFFFF] mt-2">
            Status | {listData?.isCompleted ? "Completed" : "Pending"}
          </Text>

          <View className="flex flex-row items-center gap-[4px]">
            <View className="flex flex-row items-center gap-[4px]">
              <Image resizeMode="contain" source={calendar} />
              <Text className="text-[14px] font-PoppinsRegular text-[#FFFFFF] mt-2">
                {formatDate(listData?.date)} |
              </Text>
            </View>
            <View className="flex flex-row items-center gap-[4px]">
              <Image resizeMode="contain" source={clock} />
              <Text className="text-[14px] font-PoppinsRegular text-[#FFFFFF] mt-2">
                {formatTime(listData?.time)}
              </Text>
            </View>
          </View>
          <View className="flex flex-row items-center gap-1">
            <Text className="text-[14px] font-PoppinsRegular text-[#FFFFFF] mt-2">
              Owner |
            </Text>
            <View className="flex flex-row justify-center items-center gap-1">
              <Image
                className="w-[15px] h-[15px] rounded-full"
                resizeMode="contain"
                source={{ uri: listData?.ownerDetail?.avatar }}
              />
              <Text className="text-white font-PoppinsRegular text-[12px]">
                {listData?.ownerDetail?.name}
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
              onPress={() =>
                !listData?.isCompleted &&
                showConfirmationAlert("Are you sure ?")
              }
              className="flex-1 flex flex-col justify-center items-center gap-[10px] bg-[#05243E] h-[71px] rounded-[10px]"
              style={{
                shadowColor: "#FFFFFF",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 8,
                elevation: 7,
                opacity:
                  user?.$id != listData?.owner || listData?.isCompleted
                    ? 0.5
                    : 1,
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
                opacity: user?.$id != listData?.owner ? 0.5 : 1,
              }}
              onPress={() => showDeleteConfirmation()}
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
              onPress={() => updatePinStatus()}
            >
              <Image resizeMode="contain" source={pin} />
              <Text className="text-[14px] font-PoppinsMedium text-[#FFFFFF]">
                {listData?.pinned ? "un-Pin" : "Pin"}
              </Text>
            </TouchableOpacity>
          </View>
          {/* MEMBERS */}
          <Text className="text-white font-PoppinsMedium mt-5">Members</Text>
          <View className="flex flex-row gap-4 mt-2">
            {listData?.members.map((m: DBUserData) => {
              return (
                <View
                  key={m.$id}
                  className="flex justify-center items-center gap-1"
                >
                  <Image
                    className="w-[25px] h-[25px] rounded-full"
                    resizeMode="contain"
                    source={{ uri: m.avatar }}
                  />
                  <Text className="text-white font-PoppinsRegular text-[12px]">
                    {m.name}
                  </Text>
                </View>
              );
            })}
          </View>
             {/* // COMMENT SECTION */}
       <View className="flex-row items-center justify-between gap-[8px] mt-4">
        <View className="bg-[#6d90bd] w-[220px] h-[42px] rounded-[10px] flex-row items-center justify-between p-4">
          <TextInput
            style={{ height: 40, width: "90%", color: "#FFFFFF" }}
            onChangeText={setComment}
            value={comment}
            placeholder={`add your comments`}
            placeholderTextColor={"#FFFFFF"}
          />
        </View>

        <View className="bg-[#6d90bd] flex-1 h-[42px] flex-row gap-2 justify-center items-center rounded-[10px]">
          <Ionicons name="add-circle" size={17} color="#FFFFFF" />
          <Text className="text-[#FFFFFF] text-[14px] font-PoppinsMedium">
            Add
          </Text>
        </View>
      </View>
        </>
      )}
    </View>
  );
};

export default GroupTaskScreen;
