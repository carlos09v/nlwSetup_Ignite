import './src/lib/dayjs'
import { Button, StatusBar } from 'react-native';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold } from '@expo-google-fonts/inter'
import Loading from './src/components/Loading';
import Routes from './src/routes';
import * as Notifications from 'expo-notifications'

// Local Notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false
  })
})

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold
  })

  const scheduleNotification = async () => {
    const trigger = new Date(Date.now())
    trigger.setMinutes(trigger.getMinutes() + 1) // 1 minute

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Olá, usuário !',
        body: 'Você praticou seus hábitos hoje?'
      },
      trigger
    })
  }

  // Schedules List
  const getScheduleNotification = async () => {
    const schedules = await Notifications.getAllScheduledNotificationsAsync()
    console.log(schedules)
  }

  // Se as fontes ñ tiverem sido carregadas, renderizar o Loading
  if (!fontsLoaded) return <Loading />

  return (
    <>
      {/* <Button title='Enviar notificação' onPress={scheduleNotification} />
      <Button title='Ver' onPress={getScheduleNotification} /> */}
      <Routes />
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
    </>
  );
}