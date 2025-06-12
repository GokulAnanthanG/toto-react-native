import {
  database,
  DB_id,
  groupTaskAddPermission_collection,
  usersCollection,
} from "@/config/appWrite";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState, useCallback } from "react";
import { DBUserData } from "@/interface/UserInterface";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ID, Query } from "react-native-appwrite";
import { useGlobalContext } from "@/hooks/global-provider";
import { permissionRequest } from "@/interface/PermissionData";
const back = require("@/assets/images/angleLeft.png");

const Request = () => {
  const { user } = useGlobalContext();
  const [userData, setUserData] = useState<DBUserData[]>([]);
  const [searchTxt, setSearchTxt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const searchUsers = useCallback(async (searchText: string) => {
    if (!searchText.trim()) {
      setUserData([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await database.listDocuments(DB_id, usersCollection, [
        Query.or([
          Query.contains("userId", searchText),
          Query.contains("name", searchText),
        ]),
      ]);
      setUserData(response.documents as DBUserData[]);
    } catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert("Error", "Failed to search users");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      searchUsers(searchTxt);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTxt, searchUsers]);

  const handlePermissionRequest = useCallback(async (userId: string) => {
    if (!user?.$id) return;

    try {
      const response = await database.listDocuments(
        DB_id,
        groupTaskAddPermission_collection,
        [Query.equal("requesterId", user.$id), Query.equal("userId", userId)]
      );

      if (response.documents.length > 0) {
        const record = response.documents[0] as permissionRequest;
        
        switch (record.status) {
          case "pending":
            Alert.alert("Request Status", "Already requested waiting for user action");
            break;
          case "rejected":
            await database.updateDocument(
              DB_id,
              groupTaskAddPermission_collection,
              record.$id,
              { status: "pending" }
            );
            Alert.alert("Request Status", "Requested for permission again");
            break;
          case "approved":
            Alert.alert("Request Status", "Already requested and approved by user");
            break;
        }
      } else {
        await database.createDocument(
          DB_id,
          groupTaskAddPermission_collection,
          ID.unique(),
          { requesterId: user.$id, userId }
        );
        Alert.alert("Success", "Request sent successfully");
      }
    } catch (error) {
      console.error("Error handling permission request:", error);
      Alert.alert("Error", "Failed to process request");
    }
  }, [user?.$id]);

  const renderUserItem = useCallback(({ item }: { item: DBUserData }) => (
    <TouchableOpacity
      onPress={() => {
        Alert.alert(
          "Confirm Request",
          "Request the user to join your group task?",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Request", onPress: () => handlePermissionRequest(item.userId) }
          ]
        );
      }}
      className="flex-row items-center p-4 bg-[#FFFFFF] rounded-lg mt-3"
    >
      <Image
        source={{ uri: item.avatar }}
        className="w-[50px] h-[50px] rounded-full"
      />
      <View className="ml-4 flex-1">
        <Text className="text-[#000000] font-PoppinsMedium text-[16px]">
          {item.name}
        </Text>
        <Text className="text-[#000000] font-PoppinsRegular text-[14px] opacity-70">
          {item.email}
        </Text>
      </View>
    </TouchableOpacity>
  ), [handlePermissionRequest]);

  return (
    <View className="flex-1 px-6">
      <View className="flex-row items-center mt-10 mb-2">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-[40px] h-[40px] bg-[#FFFFFF] rounded-full justify-center items-center"
        >
          <Image
            source={back}
            className="w-[15px] h-[15px]"
            resizeMode="contain"
          />
        </TouchableOpacity>
        <View className="ml-4">
          <Text className="text-[#FFFFFF] font-PoppinsMedium text-[18px]">
            Request User
          </Text>
          <Text className="text-[#FFFFFF] font-PoppinsRegular text-[14px] opacity-70">
            Request the user to join your group task
          </Text>
        </View>
      </View>

      <View className="mt-6">
        <View className="bg-[#102D53] rounded-lg flex-row items-center px-4">
          <Ionicons name="search" size={20} color="#FFFFFF" />
          <TextInput
            className="flex-1 h-[50px] text-[#FFFFFF] ml-2 font-PoppinsRegular"
            placeholder="Search user by Name or User ID"
            placeholderTextColor="#FFFFFF80"
            value={searchTxt}
            onChangeText={setSearchTxt}
          />
        </View>

        <View className="mt-6">
          {isLoading ? (
            <View className="flex-1 justify-center items-center py-8">
              <ActivityIndicator size="large" color="#0EA5E9" />
            </View>
          ) : (
            <FlatList
              data={userData}
              keyExtractor={(item) => item.$id}
              renderItem={renderUserItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
              ListEmptyComponent={() => (
                <View className="flex-1 justify-center items-center py-8">
                  <Text className="text-[#FFFFFF] font-PoppinsRegular text-[16px] opacity-70">
                    {searchTxt ? "No users found" : "Search for users"}
                  </Text>
                </View>
              )}
            />
          )}
        </View>
      </View>
    </View>
  );
};

export default Request;
