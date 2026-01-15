import { Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-3xl font-bold mb-2 text-gray-800">Hello World!</Text>
      <Text className="text-lg text-gray-600">Welcome to FlipWord</Text>
      <View className="mt-5 p-4 bg-blue-500 rounded-lg shadow-lg">
        <Text className="text-white font-bold text-center">ReactWind (NativeWind) is Active!</Text>
      </View>
    </View>
  );
}

