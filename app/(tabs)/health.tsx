import { View, Text, StyleSheet } from 'react-native';

export default function HealthScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Health</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F', alignItems: 'center', justifyContent: 'center' },
  text: { color: '#E8E4DE', fontFamily: 'DMSans_700Bold', fontSize: 24 },
});
