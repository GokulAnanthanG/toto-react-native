import { formatDate, formatTime } from "@/Common/DateTimeFormatter";
import {
  database,
  DB_id,
  groupTaskAddPermission_collection,
  task_collection,
  usersCollection,
} from "@/config/appWrite";
import { useGlobalContext } from "@/hooks/global-provider";
import { permission } from "@/interface/PermissionT";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Query } from "react-native-appwrite";
import { FlatList } from "react-native-gesture-handler";

const Permission = () => {
  const { isLoggedIn, refetch, loading, user } = useGlobalContext();
  const [isloading, setIsloading] = useState<boolean>(false);
  const [permissions, setPermissons] = useState<any[]>([]);
  const [page, setPage] = useState<number>(0);
  const [canLoad, setCanLoadMore] = useState<boolean>(false);
  const limit = 10;

  const fetch = async (clear: boolean = false) => {
    if (isloading) return;
    setIsloading(true);
  
    try {
      const result = await database.listDocuments(
        DB_id,
        groupTaskAddPermission_collection,
        [
          Query.or([
            Query.equal("requesterId", user?.$id ?? ""),
            Query.equal("userId", user?.$id ?? ""),
          ]),
          Query.limit(limit),
          Query.offset(clear ? 0 : page * limit),
        ]
      );
  
      const data = await Promise.all(
        result.documents.map(async (e) => {
          const yourRoleHere = e.userId == user?.$id ? "user" : "requester";
          const userDetails = await database.listDocuments(
            DB_id,
            usersCollection,
            [
              Query.equal(
                "userId",
                yourRoleHere == "user" ? e.requesterId : e.userId
              ),
            ]
          );
  
          return {
            ...e,
            userDetails: userDetails.documents[0],
            yourRoleHere,
          };
        })
      );
  
      if (clear) {
        setPermissons(data);
        setPage(1); // start from 1 since offset 0 is already fetched
      } else {
        setPermissons((prev) => [...prev, ...data]);
        setPage((prev) => prev + 1);
      }
    } catch (err) {
      alert("failed to get list");
      console.log(err);
    } finally {
      setIsloading(false);
    }
  };
  
  useEffect(() => {
    fetch();
  }, []);
  const showConfirmationAlert = (msg:string,recordId: string,status:string) => {
    Alert.alert(
      "Confirm to submit",
      msg,
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          onPress: () => updateStatus(recordId,status),
        },
      ],
      { cancelable: true }
    );
  };
  const updateStatus = async (id: string,status:string) => {
    try {
      const updatedDocument = await database.updateDocument(
        DB_id,
        groupTaskAddPermission_collection,
        id,
        {
          status
        }
      );
      console.log("updated=?",updatedDocument);
     fetch(true);
    } catch (err) {
      alert("error fetching,inserting or update document");
    }
  };

  function itemJsx(item: permission | any) {
    return (
      <View key={item.$collectionId}>
        <View className="w-full py-[12px] px-[15px] bg-[#FFFFFF] rounded-lg mt-[10px] flex-row justify-evenly gap-[10px] items-center">
          <View>
            <Ionicons name="notifications-circle" size={26} color="#0EA5E9" />
          </View>
          <View>
            <Text className="font-PoppinsMedium  text-justify text-[14px] text-[#000000] w-[180px]">
              {item.userId == user?.$id
                ? "You have a request from " +
                  item.userDetails.name +
                  " to add you to in their group task"
                : "You have requested " +
                  item.userDetails.name +
                  " to add in your group task"}
            </Text>
            {item.userId == user?.$id && item.status == "pending" ? (
              <View className="flex flex-row gap-[10px]">
                <TouchableOpacity className="border border-gray-300 rounded-md p-1" onPress={()=>showConfirmationAlert("Are you sure want to approve ?",item.$id,"approved")}>
                  <Text className="text-green-800">Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity className="border border-gray-300 rounded-md p-1" onPress={()=>showConfirmationAlert("Are you sure want to reject",item.$id,"rejected")}>
                  <Text className="text-red-700">Reject</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity>
                <Text
                  className={`${
                    item.status == "pending"
                      ? "text-orange-500"
                      : item.status == "approved"
                      ? "text-green-800"
                      : "text-red-600"
                  }`}
                >
                  {item.status}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  }
  return (
    <View>
      <View className="pt-[10px]">
        <FlatList
          contentContainerStyle={{ paddingBottom: 230 }}
          scrollEnabled
          showsVerticalScrollIndicator={false}
          data={permissions}
          keyExtractor={(item) => String(item.$id)}
          renderItem={({ item }) => itemJsx(item)}
          onEndReached={() => {
            if (canLoad) {
              setCanLoadMore(false);
              fetch();
            }
          }}
          onEndReachedThreshold={0.7}
          onMomentumScrollBegin={() => setCanLoadMore(true)} //only allow to fecth during scroll
          ListFooterComponent={<>{isloading && <ActivityIndicator />}</>}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({});

export default Permission;
