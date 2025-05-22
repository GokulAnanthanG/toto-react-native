import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { FloatingAction } from "react-native-floating-action";
const person = require("@/assets/images/person.png");
const group = require("@/assets/images/group.png");
import { Ionicons } from "@expo/vector-icons";
import RBSheet from "react-native-raw-bottom-sheet";
const checkIcon = require("@/assets/images/check.png");
const decIcon = require("@/assets/images/desc.png");
const calendarIcon = require("@/assets/images/calendarIcon.png");
const clockIcon = require("@/assets/images/clock.png");
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  database,
  DB_id,
  groupTask_collection,
  groupTaskAddPermission_collection,
  task_collection,
  usersCollection,
} from "@/config/appWrite";
import { ID, Query } from "react-native-appwrite";
import ListRenderer from "@/app/AppComponents/Renderers/ListRenderer";
import SectionedMultiSelect from "react-native-sectioned-multi-select";
import { useGlobalContext } from "@/hooks/global-provider";
import { UserData } from "@/interface/UserInterface";
import { TaskType } from "@/enum/TaskTypeEnum";
import { router } from "expo-router";
import GroupTaskList from "@/app/AppComponents/Renderers/GroupTaskList";
import { Picker } from "@react-native-picker/picker";
const List = () => {
  const { isLoggedIn, refetch, loading, user } = useGlobalContext();
  const [searchTxt, setSearchTxt] = React.useState("");
  const refRBSheet: any = useRef();
  const refRBSheet2: any = useRef();
  const [date, setDate] = useState(new Date());
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [time, setTime] = useState(new Date());
  const [show, setShow] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [friends, setFriends] = useState<UserData[] | any>([]);
  const [selectedFilterOpt, setSelectedFilterOpt] = useState("all");
  const getFriends = async () => {
    try {
      console.log("calling");

      const result = await database.listDocuments(
        DB_id,
        groupTaskAddPermission_collection,
        [
          Query.equal("requesterId", user?.$id ?? ""),
          Query.equal("status", "approved"),
        ]
      );

      console.log("friends ", result);

      let modifiedData = [];

      for (let i = 0; i < result.total; i++) {
        let userDetails = await database.listDocuments(
          DB_id,
          usersCollection,
          [Query.equal("userId", result.documents[i].userId)] // use i here, not 0
        );

        let userDetail = userDetails.documents[0];

        let obj = {
          name: userDetail?.name,
          id: userDetail?.userId,
          avatar: userDetail?.avatar,
          email: userDetail?.email,
        };

        console.log("mod obj", obj);

        modifiedData.push(obj);
      }
      setFriends(modifiedData);
    } catch (err) {
      Alert.alert("oops something went wrong :(");
      console.log("Failed to take friends", err);
    }
  };

  useEffect(() => {
    getFriends();
  }, []);
  const actions = [
    {
      text: "Task",
      icon: person,
      name: "task",
      position: 2,
    },
    {
      text: "Group Task",
      icon: group,
      name: "group",
      position: 1,
    },
  ];

  const addTask = async () => {
    console.log("add");

    try {
      const result = await database.createDocument(
        DB_id,
        task_collection,
        ID.unique(),
        {
          title,
          description,
          date: date.toISOString(),
          time: time.toISOString(),
        }
      );
      refRBSheet?.current.close();
      setDescription("");
      setTitle("");
    } catch (err) {
      Alert.alert("oops something went wrong :(");
      console.log("Failed to add task", err);
    }
  };
  const addTask2 = async () => {
    console.log("add", selectedItems);

    try {
      const result = await database.createDocument(
        DB_id,
        groupTask_collection,
        ID.unique(),
        {
          title,
          description,
          date: date.toISOString(),
          time: time.toISOString(),
          members: selectedItems,
          owner: user?.$id ?? "",
        }
      );
      refRBSheet2?.current.close();
      setDescription("");
      setTitle("");
      Alert.alert("Group task added :)");
    } catch (err) {
      Alert.alert("oops something went wrong :(");
      console.log("Failed to add task", err);
    }
  };

  const items = [
    { name: "Item 1", id: 1 },
    { name: "Item 2", id: 2 },
    { name: "Item 1", id: 3 },
    { name: "Item 2", id: 4 },
    { name: "Item 1", id: 5 },
    { name: "Item 2", id: 6 },
    { name: "Item 1", id: 7 },
    { name: "Item 2", id: 8 },
    { name: "Item 1", id: 9 },
    { name: "Item 2", id: 10 },
    { name: "Item 1", id: 11 },
    { name: "Item 2", id: 12 },
  ];

  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const onSelectedItemsChange = (selected: number[]) => {
    console.log("SELECTED ITEMS", selected);

    setSelectedItems(selected);
  };
  const [selectedType, setSelectedType] = useState(TaskType.task);
  return (
    <View className="flex-1 px-[18px] pt-[18px]">
      <View className="flex-row items-center justify-between gap-[8px]">
        <View className="bg-[#102D53] w-[220px] h-[42px] rounded-[10px] flex-row items-center justify-between p-4">
          <TextInput
            style={{ height: 40, width: "90%", color: "#FFFFFF" }}
            onChangeText={setSearchTxt}
            value={searchTxt}
            placeholder="Search By Task Title"
            placeholderTextColor={"#FFFFFF"}
          />
          <Ionicons name="search" size={17} color="#FFFFFF" />
        </View>

        <View className="bg-[#102D53] flex-1 h-[42px] rounded-[10px] flex-row items-center justify-center px-2">
          <Text className="text-[#FFFFFF] text-[10px] font-PoppinsMedium  ml-1">
            Sort by
          </Text>
          <View className="flex-1">
            <Picker
              selectedValue={selectedFilterOpt}
              onValueChange={(itemValue, itemIndex) =>
                setSelectedFilterOpt(itemValue)
              }
              style={{ color: "#FFFFFF", marginTop: -3 }}
              dropdownIconColor="#FFFFFF"
            >
              <Picker.Item label="All" value="all" />
              <Picker.Item label="Completed" value="true" />
              <Picker.Item label="In-Completed" value="false" />
            </Picker>
          </View>
        </View>
      </View>
      {/* OPTION BOX */}
      <View className="pt-[15px]">
        <View className="flex flex-row justify-start gap-[10px]">
          <TouchableOpacity
            onPress={() => {
              setSelectedType(TaskType.task);
            }}
            className={`w-auto border rounded-md border-gray-400 p-1.5 ${
              selectedType == TaskType.task ? "border-white" : ""
            }`}
          >
            <Text
              className={`text-center  text-[11px] ${
                selectedType == TaskType.task ? "text-white" : " text-gray-400"
              }`}
            >
              Task
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setSelectedType(TaskType.groupTask);
            }}
            className={`w-auto border rounded-md border-gray-400 p-1.5 ${
              selectedType == TaskType.groupTask ? "border-white" : ""
            }`}
          >
            <Text
              className={`text-center  text-[11px] ${
                selectedType == TaskType.groupTask
                  ? "text-white"
                  : " text-gray-400"
              }`}
            >
              Group Task
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* RENDERING LISTS */}
      {selectedType == TaskType.task ? (
        <ListRenderer filterBy={selectedFilterOpt} />
      ) : (
        <GroupTaskList filterBy={selectedFilterOpt} />
      )}
      <FloatingAction
        actions={actions}
        onPressItem={(name) => {
          setDate(new Date());
          setTime(new Date());
          setTitle("");
          setDescription("");
          if (name == "task") {
            refRBSheet?.current.open();
          }
          if (name == "group") {
            refRBSheet2?.current.open();
          }
        }}
      />

      <RBSheet
        ref={refRBSheet}
        height={474}
        customStyles={{
          wrapper: {
            backgroundColor: "transparent",
          },
          draggableIcon: {
            backgroundColor: "#000",
          },
        }}
        customModalProps={{
          animationType: "slide",
          statusBarTranslucent: true,
        }}
        customStyles={{
          container: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            backgroundColor: "#FFFFFF",
            bottom: -30,
          },
        }}
      >
        <View className="px-[27px] pt-[54px]">
          <View className="w-full h-[42px] bg-[#05243E] rounded-[5px] flex flex-row items-center gap-[10px] px-[16px]">
            <Image resizeMode="contain" source={checkIcon} />
            <TextInput
              style={{ height: 40, width: "90%", color: "#FFFFFF" }}
              onChangeText={setTitle}
              value={title}
              placeholder="task"
              placeholderTextColor={"#FFFFFF"}
            />
          </View>

          <View className="mt-[34px] w-full h-[159px] bg-[#05243E] rounded-[5px] flex flex-row  gap-[10px] px-[16px]">
            <Image className="mt-4" resizeMode="contain" source={decIcon} />
            <TextInput
              style={{
                height: "100%",
                width: "90%",
                color: "#FFFFFF",
                textAlignVertical: "top",
              }}
              onChangeText={setDescription}
              value={description}
              multiline={true}
              placeholder="Task detailed description"
              placeholderTextColor={"#FFFFFF"}
            />
          </View>

          <View className="flex flex-row gap-[19px] mt-[34px]">
            <TouchableOpacity
              onPress={() => setShow(true)}
              className="flex-1 h-[42px] bg-[#05243E] rounded-[5px] flex flex-row items-center gap-[10px] px-[16px]"
            >
              <Image resizeMode="contain" source={calendarIcon} />
              <TextInput
                readOnly
                style={{ height: 40, width: "100%", color: "#FFFFFF" }}
                onChangeText={setSearchTxt}
                value={date.toLocaleDateString()}
                placeholder="Date"
                placeholderTextColor={"#FFFFFF"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowTime(true)}
              className="flex-1 h-[42px] bg-[#05243E] rounded-[5px] flex flex-row items-center gap-[10px] px-[16px]"
            >
              <Image resizeMode="contain" source={clockIcon} />
              <TextInput
                readOnly
                style={{ height: 40, width: "100%", color: "#FFFFFF" }}
                onChangeText={setSearchTxt}
                value={time.toLocaleTimeString()}
                placeholder="Time"
                placeholderTextColor={"#FFFFFF"}
              />
            </TouchableOpacity>
          </View>

          <View className="flex flex-row gap-[19px] mt-[20px]">
            <TouchableOpacity
              onPress={() => refRBSheet?.current.close()}
              className="flex-1 h-[42px] border-[2px] border-[#0EA5E9]  rounded-[5px] flex flex-row items-center justify-center gap-[10px]  "
            >
              <Text className="font-PoppinsMedium">cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={addTask}
              className="flex-1 h-[42px] bg-[#0EA5E9] rounded-[5px] flex flex-row items-center justify-center gap-[10px]"
            >
              <Text className="font-PoppinsMedium text-[#FFFFFF]">Create</Text>
            </TouchableOpacity>
          </View>
        </View>
      </RBSheet>
      {/* GROUP BOTTOMSHEET */}
      <RBSheet
        ref={refRBSheet2}
        height={610}
        customStyles={{
          wrapper: {
            backgroundColor: "transparent",
          },
          draggableIcon: {
            backgroundColor: "#000",
          },
        }}
        customModalProps={{
          animationType: "slide",
          statusBarTranslucent: true,
        }}
        customStyles={{
          container: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            backgroundColor: "#FFFFFF",
            bottom: -30,
          },
        }}
      >
        <View className="px-[27px] pt-[54px]">
          <View className="w-full h-[42px] bg-[#05243E] rounded-[5px] flex flex-row items-center gap-[10px] px-[16px]">
            <Image resizeMode="contain" source={checkIcon} />
            <TextInput
              style={{ height: 40, width: "90%", color: "#FFFFFF" }}
              onChangeText={setTitle}
              value={title}
              placeholder="task"
              placeholderTextColor={"#FFFFFF"}
            />
          </View>

          <View className="mt-[34px] w-full h-[159px] bg-[#05243E] rounded-[5px] flex flex-row  gap-[10px] px-[16px]">
            <Image className="mt-4" resizeMode="contain" source={decIcon} />
            <TextInput
              style={{
                height: "100%",
                width: "90%",
                color: "#FFFFFF",
                textAlignVertical: "top",
              }}
              onChangeText={setDescription}
              value={description}
              multiline={true}
              placeholder="Task detailed description"
              placeholderTextColor={"#FFFFFF"}
            />
          </View>

          <View className="flex flex-row gap-[19px] mt-[34px]">
            <TouchableOpacity
              onPress={() => setShow(true)}
              className="flex-1 h-[42px] bg-[#05243E] rounded-[5px] flex flex-row items-center gap-[10px] px-[16px]"
            >
              <Image resizeMode="contain" source={calendarIcon} />
              <TextInput
                readOnly
                style={{ height: 40, width: "100%", color: "#FFFFFF" }}
                onChangeText={setSearchTxt}
                value={date.toLocaleDateString()}
                placeholder="Date"
                placeholderTextColor={"#FFFFFF"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowTime(true)}
              className="flex-1 h-[42px] bg-[#05243E] rounded-[5px] flex flex-row items-center gap-[10px] px-[16px]"
            >
              <Image resizeMode="contain" source={clockIcon} />
              <TextInput
                readOnly
                style={{ height: 40, width: "100%", color: "#FFFFFF" }}
                onChangeText={setSearchTxt}
                value={time.toLocaleTimeString()}
                placeholder="Time"
                placeholderTextColor={"#FFFFFF"}
              />
            </TouchableOpacity>
          </View>
          <View className="mt-[34px] w-full h-[auto] bg-[#05243E] rounded-[5px] flex flex-row  gap-[10px] px-[16px]">
            <ScrollView className="h-[105px] pb-10">
              <SectionedMultiSelect
                items={friends}
                uniqueKey="id"
                onSelectedItemsChange={onSelectedItemsChange}
                selectedItems={selectedItems}
                selectText="select task members"
                searchPlaceholderText="select members"
                IconRenderer={Ionicons}
                showDropDowns={true}
                styles={{
                  selectToggleText: {
                    color: "#FFFFFF",
                  },
                  chipText: {
                    color: "#fff",
                  },
                  scrollView: {
                    flex: 1,
                  },
                }}
                icons={{
                  check: {
                    name: "checkmark",
                    size: 20,
                    color: "#0EA5E9",
                  },
                  search: {
                    name: "search",
                    size: 20,
                    color: "#000",
                  },
                  arrowUp: {
                    name: "chevron-up",
                    size: 20,
                    color: "#000",
                  },
                  arrowDown: {
                    name: "chevron-down",
                    size: 20,
                    color: "#000",
                  },
                  close: {
                    name: "close",
                    size: 20,
                    color: "#000",
                  },
                }}
              />
            </ScrollView>
          </View>
          <View className="flex flex-row gap-[19px] mt-[20px]">
            <TouchableOpacity
              onPress={() => refRBSheet2?.current.close()}
              className="flex-1 h-[42px] border-[2px] border-[#0EA5E9]  rounded-[5px] flex flex-row items-center justify-center gap-[10px]  "
            >
              <Text className="font-PoppinsMedium">cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={addTask2}
              className="flex-1 h-[42px] bg-[#0EA5E9] rounded-[5px] flex flex-row items-center justify-center gap-[10px]"
            >
              <Text className="font-PoppinsMedium text-[#FFFFFF]">Create</Text>
            </TouchableOpacity>
          </View>
        </View>
      </RBSheet>
      {/* Date picker */}
      {show && (
        <DateTimePicker
          mode="date"
          value={date}
          onChange={(event: any, selectedDate: any) => {
            if (selectedDate) {
              setDate(selectedDate);
            }
            setShow(false);
          }}
        />
      )}
      {/* Time Picker */}
      {/* Date picker */}
      {showTime && (
        <DateTimePicker
          mode="time"
          value={time}
          onChange={(event: any, seletedTime: any) => {
            if (seletedTime) {
              setTime(seletedTime);
            }
            setShowTime(false);
          }}
        />
      )}
    </View>
  );
};

export default List;
