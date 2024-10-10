import { useEffect, useRef, useState } from "react";
import { SafeAreaView, Alert, BackHandler } from "react-native";
import WebView, { WebViewMessageEvent } from "react-native-webview";
import * as Device from "expo-device";
import JailMonkey from "jail-monkey";

const App: React.FC = () => {
  const webViewRef = useRef<WebView>(null);
  const [deviceName, setDeviceName] = useState<string>();
  const [modelName, setModelName] = useState<string>();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    if (JailMonkey.isJailBroken()) {
      Alert.alert(
        "Security Alert",
        "This app cannot run on jailbreak device for security reason.",
        [{ text: "OK", onPress: () => BackHandler.exitApp() }],
        { cancelable: false }
      );
    }
  }, []);

  useEffect(() => {
    const fetchDeviceInfo = async () => {
      if (Device.isDevice) {
        const name = await Device.deviceName;
        setDeviceName(name || "Unknown Device");
      } else {
        setDeviceName("Emulator/Simulator");
      }
    };

    const model = Device.modelName;
    setModelName(model || "Unknown Model");

    fetchDeviceInfo();
  }, []);

  useEffect(() => {
    const backAction = () => {
      if (canGoBack) {
        // @ts-ignore
        webViewRef.current.goBack();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [canGoBack]);

  const handleMessage = (event: WebViewMessageEvent) => {
    const message = event.nativeEvent.data;
    Alert.alert("Message from WebView", message);
    console.log("Message from WebView", message);
  };

  const data = {
    message: "Hello From React Native",
    device_name: deviceName,
    model_name: modelName,
  };

  const sendMessageToWeb = () => {
    if (webViewRef.current) {
      console.log("Sending message to WebView");
      webViewRef.current.postMessage(JSON.stringify(data));
    } else {
      console.error("WebView reference is null.");
    }
  };

  const handleLoadEnd = () => {
    sendMessageToWeb();
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <WebView
        ref={webViewRef}
        source={{ uri: "https://genuine-scone-f8d469.netlify.app" }} // Replace with your web server URL
        onMessage={handleMessage}
        onNavigationStateChange={(navState) => setCanGoBack(navState.canGoBack)}
        onLoadEnd={handleLoadEnd} // Trigger sending message after load completes
      />
    </SafeAreaView>
  );
};

export default App;
