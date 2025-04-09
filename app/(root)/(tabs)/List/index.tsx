import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  Platform,
} from "react-native";
import React, { useRef, useState } from "react";
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
import Snackbar from "react-native-snackbar";
import { database, DB_id, task_collection } from "@/config/appWrite";
import { ID } from "react-native-appwrite";
import ListRenderer from "@/app/AppComponents/Headers/Renderers/ListRenderer";
 
const List = () => {
  const [searchTxt, setSearchTxt] = React.useState("");
  const refRBSheet = useRef();
  const [date, setDate] = useState(new Date());
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [time, setTime] = useState(new Date());
  const [show, setShow] = useState(false);
  const [showTime, setShowTime] = useState(false);

  
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

  const addTask=async()=>{
    console.log("add");
    
 try{
  const result =await database.createDocument(DB_id,task_collection,ID.unique(),{
    title,
    description,
    date: date.toISOString(),  
    time: time.toISOString() 
  });
  console.log(result);
  }

 catch(err){
  console.log("Failed to add task",err);
 }
  }

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

        <View className="bg-[#102D53] flex-1 h-[42px] flex-row gap-3 justify-center items-center rounded-[10px]">
          <Ionicons name="filter" size={17} color="#FFFFFF" />
          <Text className="text-[#FFFFFF] text-[10px] font-PoppinsMedium">
            Short by
          </Text>
        </View>
      </View>
      {/* RENDERING LISTS */}
      <ListRenderer/> 
      <FloatingAction
        actions={actions}
        onPressItem={(name) => {
          if (name == "task") {
            refRBSheet?.current.open();
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
              placeholder="Search By Task Title"
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
            <TouchableOpacity onPress={()=>refRBSheet?.current.close()} className="flex-1 h-[42px] border-[2px] border-[#0EA5E9]  rounded-[5px] flex flex-row items-center justify-center gap-[10px]  ">
              <Text className="font-PoppinsMedium">cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={addTask} className="flex-1 h-[42px] bg-[#0EA5E9] rounded-[5px] flex flex-row items-center justify-center gap-[10px]">
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
