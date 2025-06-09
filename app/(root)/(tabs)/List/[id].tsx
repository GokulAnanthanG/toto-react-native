import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
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
  const [listData, setData] = useState<Task>();
  const { id } = useLocalSearchParams();
  const [isLoading, setLoading] = useState<boolean>(false);
  const fetch = async () => {
    try {
      setLoading(true);
      const response: any = await database.getDocument(
        DB_id,
        task_collection,
        String(id)
      );
      setData(response);
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
        task_collection,
        String(id),
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
      await database.deleteDocument(DB_id, task_collection, String(id));
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
        task_collection,
        String(id),
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
          <View className="flex flex-row items-center gap-[14px] mt-[36px]">
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
                opacity: listData?.isCompleted ? 0.5 : 1,
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
        </>
      )}
    </View>
  );
};

export default Details;
