import { Image, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.brand}>
          <Image source={require('../../assets/logo.png')} style={styles.logo} accessible={false} />
          <Text style={styles.brandName}>Fridgy</Text>
        </View>
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
    backgroundColor: '#eaf4fc',
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
  brand: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 12,
  },
  logo: {
    width: 88,
    height: 88,
    resizeMode: 'contain',
  },
  brandName: {
    color: '#0b1b2b',
    fontFamily: Platform.select({ ios: 'Arial Rounded MT Bold', android: 'sans-serif-rounded' }),
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1.5,
  },
  title: {
    color: '#0b1b2b',
    fontSize: 44,
    fontWeight: '700',
    letterSpacing: -1.5,
    lineHeight: 48,
  },
  summary: {
    color: '#4f6071',
    fontSize: 18,
    lineHeight: 28,
    marginTop: 24,
  },
});
