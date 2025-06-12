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
import {
  database,
  DB_id,
  groupTask_collection,
  usersCollection,
} from "@/config/appWrite";
import { Query, Models } from "react-native-appwrite";
import { router } from "expo-router";
import { formatDate, formatTime } from "@/Common/DateTimeFormatter";
import { useGlobalContext } from "@/hooks/global-provider";
import { GroupTaskT } from "@/interface/GroupTaskT";
import ImgRenderer from "./ImgRenderer";
const pin = require("@/assets/images/Pin.png");

interface GroupTaskListProps {
  filterBy: string;
  searchTxt: string;
}

interface GroupTaskWithDetails {
  $collectionId: string;
  $createdAt: string;
  $databaseId: string;
  $id: string;
  $permissions: string[];
  $updatedAt: string;
  date: string;
  description: string;
  isCompleted: boolean;
  members: Models.Document[][];
  owner: string;
  ownerDetails: Models.DocumentList<Models.Document>;
  pinned: boolean;
  time: string;
  title: string;
}

interface GroupTaskListRef {
  addNewTask: (task: GroupTaskWithDetails) => void;
}

const GroupTaskList = forwardRef<GroupTaskListRef, GroupTaskListProps>((props, ref) => {
  const { isLoggedIn, refetch, loading, user } = useGlobalContext();
  const isLoadingRef = useRef<boolean>(false);
  const isMounted = useRef<boolean>(true);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const flatListRef = useRef<FlatList>(null);
  const [isLoading, setIsloading] = useState<boolean>(false);
  const [lists, setLists] = useState<GroupTaskWithDetails[]>([]);
  const [pinnedLists, setPinnedLists] = useState<GroupTaskWithDetails[]>([]);
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const limit = 5;  

   useImperativeHandle(ref, () => ({
    addNewTask: (task: GroupTaskWithDetails) => {
      if (task.pinned) {
        setPinnedLists(prev => [task, ...prev]);
      } else {
        setLists(prev => [task, ...prev]);
      }
    }
  }));

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchPinnedTasks = async () => {
    if (!user) return;
    
    try {
      const pinnedResult = await database.listDocuments(
        DB_id,
        groupTask_collection,
        [
          Query.equal("pinned", true),
          Query.limit(100),
          Query.orderDesc("date"),
          Query.or([
            Query.equal("owner", user.$id),
            Query.contains("members", user.$id)
          ])
        ]
      );
      
      const pinnedData = await Promise.all(
        pinnedResult?.documents?.map(async (task: Models.Document) => {
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
            ownerDetails: await database.listDocuments(
              DB_id,
              usersCollection,
              [Query.equal("userId", groupTask.owner)]
            ),
          };
        })
      );

      if (isMounted.current) {
        setPinnedLists(pinnedData as GroupTaskWithDetails[]);
      }
    } catch (err) {
      console.log("Error fetching pinned items:", err);
      Alert.alert("Error", "Failed to fetch pinned tasks");
    }
  };

  const fetchTasks = async (isNewSearch: boolean = false) => {
    if (isLoading || isLoadingRef.current || !user) return;
    
    if (isNewSearch) {
      setIsloading(true);
    } else {
      isLoadingRef.current = true;
    }
    
    try {
      let queries: any = [
        Query.limit(limit),
        Query.orderDesc("date"),
        Query.equal("pinned", false),
        Query.or([
          Query.equal("owner", user.$id),
          Query.contains("members", user.$id)
        ])
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

      const result = await database.listDocuments(DB_id, groupTask_collection, queries);
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
            ownerDetails: await database.listDocuments(
              DB_id,
              usersCollection,
              [Query.equal("userId", groupTask.owner)]
            ),
          };
        })
      );

      if (isMounted.current) {
        if (data.length === 0) {
          setHasMore(false);
        } else {
          setHasMore(true);
          if (isNewSearch) {
            setLists(data as GroupTaskWithDetails[]);
          } else {
            setLists(prev => {
              const existingIds = new Set(prev.map(item => item.$id));
              const newItems = data.filter(item => !existingIds.has(item.$id));
              return [...prev, ...newItems] as GroupTaskWithDetails[];
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
        isLoadingRef.current = false;
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

  useEffect(() => {
    if (isMounted.current) {
      setLists([]);
      setPage(0);
      setHasMore(true);
      fetchPinnedTasks();
      fetchTasks(true);
    }
  }, [props.filterBy]);

  const handleLoadMore = () => {
    if (!isLoading && hasMore && !isLoadingRef.current) {
      console.log('Loading more items...', { page, hasMore });
      fetchTasks(false);
    }
  };

  const renderItem = ({ item }: { item: GroupTaskWithDetails }) => (
    <TouchableOpacity
      onPress={() => router.push(`/List/Group/${item.$id}`)}
      key={item.$id}
      className="mb-4"
    >
      <View className="w-full h-[116px] py-[12px] bg-[#FFFFFF] rounded-lg mr-[15px] pt-[16px] px-[23px]">
        <View className="flex flex-row justify-between items-center">
          <View>
            <Text className="font-PoppinsMedium text-[16px] text-[#000000]">
              {item.title}
            </Text>
            <Text className="font-PoppinsRegular text-[12px]">
              {formatDate(item.date)} | {formatTime(item.time)}
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
            images={item?.members[0].map((e: any) => e?.avatar)}
            limit={4}
            key={item.$id}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  const ListHeader = () => (
    <>
      {pinnedLists.length > 0 && (
        <View className="mb-6">
          <Text className="text-[#FFFFFF] font-PoppinsRegular text-[14px] mb-4">
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
        <View className="mb-6">
          <Text className="text-[#FFFFFF] font-PoppinsRegular text-[14px]">
            {props.searchTxt ? "Search Results" : "Other Tasks"}
          </Text>
        </View>
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
          (isLoading || isLoadingRef.current) ? (
            <View className="py-4">
              <ActivityIndicator size="large" color="#0EA5E9" />
            </View>
          ) : null
        )}
      />
    </View>
  );
});

export default GroupTaskList;
