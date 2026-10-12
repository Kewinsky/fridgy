import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>Fridgy</Text>
        <Text accessibilityRole="header" style={styles.title}>
          Ready for development.
        </Text>
        <Text style={styles.summary}>
          The mobile application is set up and ready for its first feature.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#f7f7f5',
    flex: 1,
  },
  content: {
    alignSelf: 'center',
    flex: 1,
    justifyContent: 'center',
    maxWidth: 640,
    padding: 32,
    width: '100%',
  },
  eyebrow: {
    color: '#666660',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  title: {
    color: '#171717',
    fontSize: 44,
    fontWeight: '700',
    letterSpacing: -1.5,
    lineHeight: 48,
  },
  summary: {
    color: '#666660',
    fontSize: 18,
    lineHeight: 28,
    marginTop: 24,
  },
});
