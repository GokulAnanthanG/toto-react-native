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
import { database, DB_id, task_collection } from "@/config/appWrite";
import { Query } from "react-native-appwrite";
import { router, useFocusEffect } from "expo-router";
import { Task } from "@/interface/listInterface";
import { formatDate, formatTime } from "@/Common/DateTimeFormatter";
import { useGlobalContext } from "@/hooks/global-provider";
const pin = require("@/assets/images/Pin.png");

const ListRenderer = (props: { filterBy: any }) => {
  const { isLoggedIn, refetch, loading, user } = useGlobalContext();
  const [isLoading, setIsloading] = useState<boolean>(false);
  const isLoadingRef = useRef<boolean>(false);
  const [lists, setLists] = useState<Task[]>([]);
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const limit = 10;

  const fetch = async () => {
    // Get pinned items first if lists is empty
    if (lists.length === 0) {
      try {
        const pinnedResult = await database.listDocuments(
          DB_id,
          task_collection,
          [
            Query.equal("pinned", true),
            Query.limit(100), // Higher limit for pinned items
            Query.orderDesc("date"), // Sort pinned items by date descending
          ]
        );
        const pinnedData: any = pinnedResult?.documents;
        setLists(pinnedData);
      } catch (err) {
        console.log("Error fetching pinned items:", err);
      }
    }

    if (isLoadingRef.current || !hasMore) return;
    isLoadingRef.current = true;
    setIsloading(true);
    console.log("API CALL");
    let queries: any = [
      Query.limit(limit),
      Query.offset(page * limit),
      Query.orderDesc("date"),
    ];
    if (props.filterBy != "all") {
      queries.push(Query.equal("isCompleted", props.filterBy === "true"));
    }
    console.log(queries);

    try {
      const result = await database.listDocuments(
        DB_id,
        task_collection,
        queries
      );
      const data: any = result?.documents;
      if (data.length === 0) {
        setHasMore(false);
        return;
      }

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

  useFocusEffect(
    React.useCallback(() => {
      setLists([]);
      setPage(0);
      setHasMore(true);
      fetch();

      return () => {
        // Cleanup function
        isLoadingRef.current = false;
      };
    }, [props.filterBy])
  );

  function itemJsx(item: Task) {
    return (
      <TouchableOpacity
        onPress={() => {
          router.push(`/List/${item.$id}`);
        }}
      >
        <View className="w-full py-[12px] px-[25px] bg-[#FFFFFF] rounded-lg mt-[15px] flex-row justify-between items-center">
          <View>
            <Text className="font-PoppinsMedium text-[14px] text-[#000000]">
              {item.title}
            </Text>
            <Text className="font-PoppinsRegular text-[10px]">
              {formatDate(item.date)} | {formatTime(item.time)}
            </Text>
          </View>
          <View className="flex-row items-center">
            {item.pinned && (
              <Image className="w-[20px]" resizeMode="contain" source={pin} />
            )}
            <Ionicons name="chevron-forward" size={16} color="#0EA5E9" />
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View>
      <Text className="text-[#FFFFFF] font-PoppinsRegular text-[16px] mt-[26px]">
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
            if (!isLoading && hasMore) {
              fetch();
            }
          }}
          onEndReachedThreshold={0.7}
        />
        {isLoading && <ActivityIndicator />}
      </View>
    </View>
  );
};

export default ListRenderer;
