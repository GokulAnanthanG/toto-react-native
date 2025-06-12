import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Databases, Query } from "react-native-appwrite";
import {
  database,
  DB_id,
  groupTask_collection,
  taskComments_collection,
  usersCollection,
} from "@/config/appWrite";
import { Task } from "@/interface/listInterface";
import { formatDate, formatTime } from "@/Common/DateTimeFormatter";
import { useGlobalContext } from "@/hooks/global-provider";
import { GroupTaskViewT } from "@/interface/GroupTaskViewT";
import { DBUserData } from "@/interface/UserInterface";
import { Ionicons } from "@expo/vector-icons";
import { FlatList } from "react-native-gesture-handler";
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
  const [lists, setLists] = useState<Task[]>([]);
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const limit = 10;
  const isLoadingRef = useRef<boolean>(false);

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
  useFocusEffect(
    React.useCallback(() => {
      console.log("useFocusEffect triggered");
      setLists([]);
      setPage(0);
      setHasMore(true);
      fetchComments();

      return () => {
        console.log("useFocusEffect cleanup");
        isLoadingRef.current = false;
      };
    }, [])
  );

  const fetchComments = async () => {
    console.log("fetch command 2");
    console.log("isLoadingRef:", isLoadingRef.current, "hasMore:", hasMore);

    if (isLoadingRef.current || !hasMore) {
      console.log("fetchComments early return");
      return;
    }
    isLoadingRef.current = true;
    try {
      const result = await database.listDocuments(
        DB_id,
        taskComments_collection,
        [
          Query.equal("taskId", String(groupId)),
          Query.orderDesc("$createdAt"),
          Query.limit(limit),
          Query.offset(page * limit),
        ]
      );
      console.log("result", result);

      const data: any = result?.documents;
      if (data.length === 0) {
        if (page === 0) {
          setLists([]);
        }
        setHasMore(false);
        return;
      }

      // Fetch user data for each comment
      const commentsWithUserData = await Promise.all(
        data.map(async (comment: any) => {
          try {
            const userResult = await database.listDocuments(
              DB_id,
              usersCollection,
              [Query.equal("userId", comment.userId)]
            );
            return {
              ...comment,
              user: userResult.documents[0],
            };
          } catch (err) {
            console.error("Error fetching user data:", err);
            return comment;
          }
        })
      );

      setLists((prev) => [...prev, ...commentsWithUserData]);
      setPage((prev) => prev + 1);
      setHasMore(data.length === limit);
    } catch (err) {
      console.log("error=>comments", err);
      Alert.alert("Error", "Failed to fetch comments");
    } finally {
      isLoadingRef.current = false;
    }
  };

  const addComment = async () => {
    if (!comment.trim()) {
      Alert.alert("Error", "Please enter a comment");
      return;
    }

    try {
      setLoading(true);
      const newComment = {
        taskId: String(groupId),
        userId: user?.$id,
        comment: comment.trim(),
        timeStamp: new Date().toISOString(),
      };

      await database.createDocument(
        DB_id,
        taskComments_collection,
        "unique()",
        newComment
      );

      // Clear the input
      setComment("");

      // Reset states
      setLists([]);
      setPage(0);
      setHasMore(true);
      isLoadingRef.current = false;

      // Fetch comments immediately with user data
      const result = await database.listDocuments(
        DB_id,
        taskComments_collection,
        [
          Query.equal("taskId", String(groupId)),
          Query.orderDesc("$createdAt"),
          Query.limit(limit),
          Query.offset(0),
        ]
      );

      const data: any = result?.documents;

      // Fetch user data for the new comments
      const commentsWithUserData = await Promise.all(
        data.map(async (comment: any) => {
          try {
            const userResult = await database.listDocuments(
              DB_id,
              usersCollection,
              [Query.equal("userId", comment.userId)]
            );
            return {
              ...comment,
              user: userResult.documents[0],
            };
          } catch (err) {
            console.error("Error fetching user data:", err);
            return comment;
          }
        })
      );

      setLists(commentsWithUserData);
      setPage(1);
      setHasMore(data.length === limit);

      Alert.alert("Success", "Comment added successfully");
    } catch (error) {
      console.error("Error adding comment:", error);
      Alert.alert("Error", "Failed to add comment");
    } finally {
      setLoading(false);
    }
  };

  const itemJsx = (item: any) => {
    return (
      <View className="mt-4 bg-[#05243E] p-4 rounded-[10px]">
        <View className="flex-row items-center gap-2">
          <Image
            className="w-[25px] h-[25px] rounded-full"
            source={{ uri: item.user?.avatar }}
            resizeMode="cover"
          />
          <Text className="text-white font-PoppinsMedium">
            {item.user?.name}
          </Text>
          <Text className="text-gray-400 text-xs font-PoppinsRegular ml-auto">
            {formatDate(item.timeStamp)} {formatTime(item.timeStamp)}
          </Text>
        </View>

        <Text className="text-white font-PoppinsRegular mt-2 text-[14px]">
          {item.comment}
        </Text>
      </View>
    );
  };

  return (
    <View className="flex-1 px-[34px] pt-[18px]">
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
        <View className="flex-1">
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
          <View className="flex flex-row items-center gap-1">
            <Text className="text-[14px] font-PoppinsRegular text-[#FFFFFF] mt-2">
              Owner |
            </Text>
            <View className="flex flex-row justify-center items-center gap-1 mt-1">
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
          {/* COMMENT SECTION */}
          <Text className="text-[#FFFFFF] font-PoppinsRegular text-[16px] mt-[26px]">
            Comment Section
          </Text>
          <View className="flex-row items-center justify-between gap-[8px] mt-4">
            <View className="bg-[#05243E] w-[220px] h-[42px] flex-row items-center justify-between rounded-[2px] p-4">
              <TextInput
                style={{ height: 40, width: "90%", color: "#FFFFFF" }}
                onChangeText={setComment}
                value={comment}
                placeholder={`add your comments`}
                placeholderTextColor={"#FFFFFF"}
              />
            </View>

            <TouchableOpacity
              onPress={addComment}
              className="bg-[#0EA5E9] flex-1 h-[42px] flex-row gap-2 justify-center items-center rounded-[2px]"
            >
              <Ionicons name="add-circle" size={12} color="#FFFFFF" />
              <Text className="text-[#FFFFFF] text-[12px] font-PoppinsRegular">
                Add
              </Text>
            </TouchableOpacity>
          </View>
          {/* COMMENT LIST */}
          <View className="flex-1 mt-4">
            {isLoadingRef.current && page === 0 ? (
              <View className="items-center justify-center py-8">
                <ActivityIndicator />
              </View>
            ) : lists.length === 0 ? (
              <View className="items-center justify-center py-8">
                <Text className="text-[#FFFFFF] font-PoppinsRegular text-[14px]">
                  No comments yet
                </Text>
              </View>
            ) : (
              <FlatList
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 20 }}
                scrollEnabled={true}
                showsVerticalScrollIndicator={false}
                data={lists}
                keyExtractor={(item) => String(item.$id)}
                renderItem={({ item }) => itemJsx(item)}
                onEndReached={() => {
                  if (!isLoadingRef.current && hasMore) {
                    fetchComments();
                  }
                }}
                onEndReachedThreshold={0.7}
                ListFooterComponent={() =>
                  isLoadingRef.current && page > 0 ? (
                    <ActivityIndicator style={{ marginVertical: 20 }} />
                  ) : null
                }
              />
            )}
          </View>
        </View>
      )}
    </View>
  );
};

export default GroupTaskScreen;
