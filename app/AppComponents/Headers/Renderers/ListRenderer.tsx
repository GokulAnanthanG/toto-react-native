import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { database, DB_id, task_collection } from "@/config/appWrite";
import { Query } from "react-native-appwrite";
import { router } from "expo-router";
import { Task } from "@/interface/listInterface";
import { formatDate, formatTime } from "@/Common/DateTimeFormatter";
import { useGlobalContext } from "@/hooks/global-provider";

const ListRenderer = () => {
  const { isLoggedIn, refetch, loading, user } = useGlobalContext();
    const [isLoading, setIsloading] = useState<boolean>(false);
  const isLoadingRef = useRef<boolean>(false); 
    const [lists, setLists] = useState<Task[]>([]);
  const [page, setPage] = useState<number>(0);
  const limit = 10;

  const fetch = async () => {
    if (isLoadingRef.current) return;  
    isLoadingRef.current = true;
    setIsloading(true);
    console.log("API CALL");
    
    try {
      const result = await database.listDocuments(DB_id, task_collection, [
        Query.limit(limit),
        Query.offset(page * limit),
      ]);
      const data: any = result?.documents;
      setLists((prev) => [...prev, ...data]);
      setPage((prev) => prev + 1);
    } catch (err) {
      alert("failed to get list");
      console.log(err);
    } finally {
      isLoadingRef.current=false;
      setIsloading(false);
    }
  };
  useEffect(() => {
    fetch();
  }, []);

  function itemJsx(item: Task) {
    return (
      <TouchableOpacity
        onPress={() => {
          router.push(`/List/${item.$id}`);
        }}
        key={item.$collectionId}
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
          <View>
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
            fetch();
          }}
          onEndReachedThreshold={0.7}
         />
         {isLoading && <ActivityIndicator />}
      </View>
    </View>
  );
};

export default ListRenderer;
