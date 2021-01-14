import React, { useEffect, useState } from "react";

import { useSf } from "omni-studio-mobile-sdk-react";
import { FlatList, Text, View, StyleSheet } from "react-native";

const q = "SELECT Id, Name FROM Contact LIMIT 100";

const ContactListScreen = () => {
  const { sf } = useSf([]);
  const [contacts, setContacts] = useState();

  useEffect(() => {
    (async () => {
      const res = await sf.fetch(sf.toQueryUrl(q));

      setContacts(res.records);
    })();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={contacts}
        renderItem={({ item }) => <Text style={styles.item}>{item.Name}</Text>}
        keyExtractor={(item, index) => "key_" + index}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 22,
    backgroundColor: "white",
  },
  item: {
    padding: 10,
    fontSize: 18,
    height: 44,
  },
});

export default ContactListScreen;
