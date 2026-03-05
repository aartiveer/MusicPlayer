import { Audio } from "expo-av";

export async function setupAudioMode() {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    staysActiveInBackground: true,
    playsInSilentModeIOS: true,

    // iOS / Android interruption behavior
    interruptionModeIOS: Audio.InterruptionModeIOS.MixWithOthers,
    shouldDuckAndroid: true,
    interruptionModeAndroid: Audio.InterruptionModeAndroid.DuckOthers,
    playThroughEarpieceAndroid: false,
  });
}
