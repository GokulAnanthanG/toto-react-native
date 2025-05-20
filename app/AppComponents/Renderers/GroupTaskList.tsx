import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  database,
  DB_id,
  groupTask_collection,
  task_collection,
  usersCollection,
} from "@/config/appWrite";
import { Query } from "react-native-appwrite";
import { router } from "expo-router";
import { Task } from "@/interface/listInterface";
import { formatDate, formatTime } from "@/Common/DateTimeFormatter";
import { useGlobalContext } from "@/hooks/global-provider";
import { GroupTaskT } from "@/interface/GroupTaskT";
import ImgRenderer from "./ImgRenderer";
const pin = require("@/assets/images/Pin.png");

const GroupTaskList = (props:{filterBy:any}) => {
  const { isLoggedIn, refetch, loading, user } = useGlobalContext();
  const isLoadingRef = useRef<boolean>(false);
  const [isLoading, setIsloading] = useState<boolean>(false);
  const [lists, setLists] = useState<Task[]>([]);
  const [page, setPage] = useState<number>(0);
  const limit = 10;

  const fetch = async () => {
    // Get pinned items first if lists is empty
    if (lists.length === 0) {
      try {
        const pinnedResult = await database.listDocuments(
          DB_id,
          groupTask_collection,
          [
            Query.equal("pinned", true),
            Query.limit(100), // Higher limit for pinned items
          ]
        );
        const pinnedData: any = pinnedResult?.documents;
        console.log("pinned data", pinnedData);

        const data: any = await Promise.all(
          pinnedData?.map(async (task: GroupTaskT) => {
            return {
              ...task,
              members: await Promise.all(
                task.members.map(async (m: any) => {
                  console.log("MEMBER ID", m);

                  let result = await database.listDocuments(
                    DB_id,
                    usersCollection,
                    [Query.equal("userId", m)]
                  );
                  return result.documents;
                })
              ),
              ownerDetails: await database.listDocuments(
                DB_id,
                usersCollection,
                [Query.equal("userId", task.owner)]
              ),
            };
          })
        );
        console.log("pinned data", data);

        setLists(data);
      } catch (err) {
        console.log("Error fetching pinned items:", err);
      }
    }
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    setIsloading(true);
    try {
      const result = await database.listDocuments(DB_id, groupTask_collection, [
        Query.limit(limit),
        Query.offset(page * limit),
      ]);
      const data: any = await Promise.all(
        result?.documents?.map(async (task: GroupTaskT) => {
          return {
            ...task,
            members: await Promise.all(
              task.members.map(async (m: any) => {
                console.log("MEMBER ID", m);

                let result = await database.listDocuments(
                  DB_id,
                  usersCollection,
                  [Query.equal("userId", m)]
                );
                return result.documents;
              })
            ),
            ownerDetails: await database.listDocuments(DB_id, usersCollection, [
              Query.equal("userId", task.owner),
            ]),
          };
        })
      );
      console.log("GORUP LIST DATA", data[0]);

      setLists((prev) => [
        ...prev,
        ...data.filter((e: any) => e.pinned != true),
      ]);
      setPage((prev) => prev + 1);
    } catch (err) {
      alert("failed to get list");
      console.log(err);
    } finally {
      isLoadingRef.current = false;
      setIsloading(false);
    }
  };
  useEffect(() => {
    fetch();
  }, []);

  function itemJsx(item: any) {
    console.log("RENDERE ITEM", item.members[0]);

    return (
      <TouchableOpacity
        onPress={() => {
          router.push(`/List/Group/${item.$id}`);
        }}
        key={item.$collectionId}
      >
        <View className="w-full h-[116px]  py-[12px] bg-[#FFFFFF] rounded-lg mr-[15px] pt-[16px] px-[23px]">
          <View className="flex flex-row justify-between items-center">
            <View>
              <Text className="font-PoppinsMedium text-[16px] text-[##000000]">
                {item.title}
              </Text>
              <Text className="font-PoppinsRegular text-[12px]">
                {formatDate(item.date)} | {formatDate(item.time)}
              </Text>
            </View>
            <View>
              {item.pinned && (
                <Image className="w-[20px]" resizeMode="contain" source={pin} />
              )}
            </View>
          </View>
          <View className="relative mt-[9px]">
            <ImgRenderer
              images={item?.members[0].map((e: any) => {
                return e?.avatar;
              })}
              limit={4}
              key={item.$id}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  }
  return (
    <View>
      <Text className="text-[#FFFFFF] font-PoppinsRegular text-[16px] mt-[26px] mb-[15px]">
        Tasks List
      </Text>
      <View>
        <FlatList
          contentContainerStyle={{ paddingBottom: 230 }}
          scrollEnabled
          showsVerticalScrollIndicator={false}
          data={lists}
          keyExtractor={(item) => String(item.$id)}
          renderItem={({ item }) => itemJsx(item)}
          onEndReached={() => {
            fetch();
          }}
          onEndReachedThreshold={0.7}
        />
        {isLoading && <ActivityIndicator />}
      </View>
    </View>
  );
};

export default GroupTaskList;
