import React, { useState, useEffect } from 'react';
import {
  View,
  Button,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import notifee, {
  TriggerType,
  TimestampTrigger,
  AndroidImportance,
} from '@notifee/react-native';

const App = () => {
  const [alarmTime, setAlarmTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    requestPermission();
    createChannel();
  }, []);

  const requestPermission = async () => {
    if (Platform.OS === 'android') {
      await notifee.requestPermission();
    }
  };

  const createChannel = async () => {
    // Hapus dan buat ulang channel agar perubahan importance atau vibrationPattern diterapkan
    await notifee.deleteChannel('alarm');

    await notifee.createChannel({
      id: 'alarm',
      name: 'Alarm Channel',
      sound: 'alarm_doors',
      vibration: true,
      vibrationPattern: [300, 500],
      importance: AndroidImportance.HIGH,
    });
  };

  const scheduleAlarm = async () => {
    const now = Date.now();
    // const triggerTime = new Date(alarmTime).getTime();
    const triggerTime = Date.now() + 3 * 1000; // 10 detik ke depan

    if (triggerTime <= now) {
      alert('Waktu alarm harus di masa depan');
      return;
    }

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: triggerTime,
      alarmManager: true, // agar tetap menyala walaupun app ditutup (Android only)
    };

    await notifee.createTriggerNotification(
      {
        title: '⏰ Alarm!',
        body: 'Waktunya bangun!',
        android: {
          channelId: 'alarm',
          sound: 'alarm_doors',
          vibrationPattern: [300, 500],
          pressAction: {id: 'default'},
          smallIcon: 'ic_launcher',
          autoCancel: true,
        },
      },
      trigger
    );

    alert('Alarm berhasil dijadwalkan!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Waktu Alarms: {alarmTime.toLocaleTimeString()}</Text>
      <Button title="Pilih Waktu Alarm" onPress={() => setShowPicker(true)} />

      {showPicker && (
        <DateTimePicker
          value={alarmTime}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={(event, selectedDate) => {
            setShowPicker(false);
            if (selectedDate) {
              const updated = new Date();
              updated.setHours(selectedDate.getHours());
              updated.setMinutes(selectedDate.getMinutes());
              updated.setSeconds(0);
              setAlarmTime(updated);
            }
          }}
        />
      )}

      <View style={{ marginTop: 20 }}>
        <Button title="Set Alarm" onPress={scheduleAlarm} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  text: {
    fontSize: 18,
    marginBottom: 20,
  },
});

export default App;
