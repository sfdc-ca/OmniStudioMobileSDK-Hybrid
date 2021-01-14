import React from "react";
import { Pressable, StyleSheet } from "react-native";
import LinearGradient from "react-native-linear-gradient";

const Fab = ({ onPress, children }) => {
  return (
    <Pressable onPress={onPress} style={styles.root}>
      <LinearGradient
        style={styles.btnWrapper}
        start={{ x: 0.0, y: 0 }}
        end={{ x: 1.0, y: 1.0 }}
        colors={["#6a34ff", "#1893d1"]}
      >
        {children}
      </LinearGradient>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  root: {
    width: 60,
    height: 60,
    position: "absolute",
    backgroundColor: "#45ae91",
    borderRadius: 30,
    bottom: 15,
    right: 15,
    zIndex: 9,
  },
  btnWrapper: {
    alignItems: "center",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Fab;
