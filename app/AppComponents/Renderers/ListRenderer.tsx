import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { Ionicons } from "@expo/vector-icons";
import { database, DB_id, task_collection } from "@/config/appWrite";
import { Query } from "react-native-appwrite";
import { router, useFocusEffect } from "expo-router";
import { Task } from "@/interface/listInterface";
import { formatDate, formatTime } from "@/Common/DateTimeFormatter";
import { useGlobalContext } from "@/hooks/global-provider";
const pin = require("@/assets/images/Pin.png");

interface ListRendererProps {
  filterBy: any;
  searchTxt: string;
}

interface ListRendererRef {
  addNewTask: (task: Task) => void;
}

const ListRenderer = forwardRef<ListRendererRef, ListRendererProps>((props, ref) => {
  const { user } = useGlobalContext();
  const [isLoading, setIsloading] = useState<boolean>(false);
  const [lists, setLists] = useState<Task[]>([]);
  const [pinnedLists, setPinnedLists] = useState<Task[]>([]);
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const limit = 5; // Reduced limit for better pagination
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const isMounted = useRef(true);
  const isLoadingMore = useRef(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    addNewTask: (task: Task) => {
      setLists(prev => [task, ...prev]);
    }
  }));

  // Handle new task addition
  useEffect(() => {
    if (props.onNewTask) {
      const handleNewTask = (task: Task) => {
        setLists(prev => [task, ...prev]);
      };
      props.onNewTask = handleNewTask;
    }
  }, [props.onNewTask]);

  const fetchPinnedTasks = async () => {
    if (!user) return;
    
    try {
      const pinnedResult = await database.listDocuments(
        DB_id,
        task_collection,
        [
          Query.equal("pinned", true),
          Query.limit(100),
          Query.orderDesc("date"),
          Query.equal("userId", user.$id),
        ]
      );
      if (isMounted.current) {
        const pinnedData = (pinnedResult?.documents || []) as Task[];
        setPinnedLists(pinnedData);
      }
    } catch (err) {
      console.log("Error fetching pinned items:", err);
      Alert.alert("Error", "Failed to fetch pinned tasks");
    }
  };

  const fetchTasks = async (isNewSearch: boolean = false) => {
    if (isLoading || isLoadingMore.current || !user) return;
    
    if (isNewSearch) {
      setIsloading(true);
    } else {
      isLoadingMore.current = true;
    }
    
    try {
      let queries: any = [
        Query.limit(limit),
        Query.orderDesc("date"),
        Query.equal("pinned", false),
        Query.equal("userId", user.$id),
      ];

      if (!isNewSearch) {
        queries.push(Query.offset(page * limit));
      }

      if (props.filterBy !== "all") {
        queries.push(Query.equal("isCompleted", props.filterBy === "true"));
      }

      if (props.searchTxt && props.searchTxt.trim() !== "") {
        queries.push(Query.contains("title", props.searchTxt.trim()));
      }

      const result = await database.listDocuments(DB_id, task_collection, queries);
      const data = (result?.documents || []) as Task[];

      if (isMounted.current) {
        if (data.length === 0) {
          setHasMore(false);
        } else {
          setHasMore(true);
          if (isNewSearch) {
            setLists(data);
          } else {
            setLists(prev => {
              const existingIds = new Set(prev.map(item => item.$id));
              const newItems = data.filter(item => !existingIds.has(item.$id));
              return [...prev, ...newItems];
            });
          }
          setPage(prev => prev + 1);
        }
      }
    } catch (err) {
      console.log("Failed to fetch tasks:", err);
      Alert.alert("Error", "Failed to fetch tasks");
    } finally {
      if (isMounted.current) {
        setIsloading(false);
        isLoadingMore.current = false;
      }
    }
  };

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (isMounted.current) {
        setLists([]);
        setPage(0);
        setHasMore(true);
        fetchTasks(true);
      }
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [props.searchTxt]);

  // Add a new effect to handle immediate refresh
  useEffect(() => {
    if (isMounted.current) {
      setLists([]);
      setPage(0);
      setHasMore(true);
      fetchPinnedTasks();
      fetchTasks(true);
    }
  }, [props.filterBy]);

  const renderItem = ({ item }: { item: Task }) => (
    <TouchableOpacity
      onPress={() => router.push(`/List/${item.$id}`)}
      className="w-full py-[12px] px-[25px] bg-[#FFFFFF] rounded-lg mt-[15px] flex-row justify-between items-center"
    >
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
    </TouchableOpacity>
  );

  const handleLoadMore = () => {
    if (!isLoading && hasMore && !isLoadingMore.current) {
      console.log('Loading more items...', { page, hasMore });
      fetchTasks(false);
    }
  };

  const ListHeader = () => (
    <>
      {pinnedLists.length > 0 && (
        <View className="mb-4">
          <Text className="text-[#FFFFFF] font-PoppinsRegular text-[14px] mb-2">
            Pinned Tasks
          </Text>
          {pinnedLists.map((item) => (
            <View key={`pinned-${item.$id}`}>
              {renderItem({ item })}
            </View>
          ))}
        </View>
      )}
      
      {lists.length > 0 && (
        <Text className="text-[#FFFFFF] font-PoppinsRegular text-[14px] mb-2">
          {props.searchTxt ? "Search Results" : "Other Tasks"}
        </Text>
      )}
    </>
  );

  const EmptyListMessage = () => {
    if (props.searchTxt) {
      return (
        <View className="flex-1 items-center justify-center py-8">
          <Text className="text-[#FFFFFF] text-center font-PoppinsRegular">
            No tasks found matching "{props.searchTxt}"
          </Text>
        </View>
      );
    }
    
    if (pinnedLists.length === 0) {
      return (
        <View className="flex-1 items-center justify-center py-8">
          <Text className="text-[#FFFFFF] text-center font-PoppinsRegular">
            No tasks found. Create a new task to get started!
          </Text>
        </View>
      );
    }
    
    return null;
  };

  return (
    <View className="flex-1">
      <Text className="text-[#FFFFFF] font-PoppinsRegular text-[16px] mt-[26px]">
        Tasks List
      </Text>
      <FlatList
        ref={flatListRef}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 330 }}
        scrollEnabled
        showsVerticalScrollIndicator={false}
        data={lists}
        keyExtractor={(item) => `task-${item.$id}`}
        renderItem={renderItem}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={EmptyListMessage}
        ListFooterComponent={() => (
          (isLoading || isLoadingMore.current) ? (
            <View className="py-4">
              <ActivityIndicator size="large" color="#0EA5E9" />
            </View>
          ) : null
        )}
      />
    </View>
  );
});

export default ListRenderer;
