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

  const fetch = async () => {
    if (isloading) return; // Prevent duplicate requests
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
          Query.offset(page * limit),
        ]
      );

      const data = await Promise.all(
        result.documents.map(async (e) => {
          ////finfing what is the role of login user in this request
          const yourRoleHere =
            e.userId == user?.$id ? "user" : "requester";
            console.log("your role",yourRoleHere);
            
          const userDetails = await database.listDocuments(
            DB_id,
            usersCollection,
            [Query.equal("userId",yourRoleHere=="user"?e.requesterId:e.userId)]
          );
          return {
            ...e,
            userDetails: userDetails.documents[0],
            yourRoleHere,
          };
        })
      );
      console.log("precessed data", data);

      setPermissons((prev) => [...prev, ...data]);
      setPage((prev) => prev + 1);
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
            {item.userId == user?.$id?
            <View className="flex flex-row gap-[10px]">
              <TouchableOpacity className="border border-gray-300 rounded-md p-1">
                <Text className="text-green-800">Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity className="border border-gray-300 rounded-md p-1">
                <Text className="text-red-700">Reject</Text>
              </TouchableOpacity>
            </View>
            :
            <TouchableOpacity>
            <Text className=   {`${item.status=="pending"?"text-orange-500":item.status=="success"?"text-green-800":"text-red-600"}`}>
                {item.status}
            </Text>
          </TouchableOpacity>
            }
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
