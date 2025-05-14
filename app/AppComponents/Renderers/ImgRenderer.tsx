import { View, Text, Image } from "react-native";
import React, { useEffect } from "react";
type props = {
  images: any[];
  limit: number;
};

const ImgRenderer = (props: props) => {
 
  return (
    <>
      {props.images.slice(0,props.limit).map((image, index) => (
        <View
        key={index}
          className="w-[25px] h-[25px] rounded-full overflow-hidden absolute "
          style={{ transform: [{ translateX: index * 18 }], zIndex: index }}
        >
          <Image className="w-full h-full" source={{ uri: image }} />
        </View>
      ))}

      {props.images.length > props.limit && (
        <View
          className="w-[25px] h-[25px] rounded-full overflow-hidden absolute bg-[#D9D9D9] justify-center items-center"
          style={{
            transform: [{ translateX: props.limit * 18 }],
            zIndex: props.limit,
          }}
        >
          <Text className="text-[16px] font-[1000]">+</Text>
        </View>
      )}
    </>
  );
};

export default ImgRenderer;
