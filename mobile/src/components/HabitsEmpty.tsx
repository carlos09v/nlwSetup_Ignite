import { useNavigation } from '@react-navigation/native'
import { Text } from 'react-native'

const HabitsEmpty = () => {
    const { navigate } = useNavigation()

  return (
    <Text className='text-zinc-400 text-base'>
        Você não esta monitorando nenhum hábito ! {' '}

        <Text className='text-violet-400 text-base underline active:text-violet-500' onPress={() => navigate('new')}>
            Comece cadastrando um :)
        </Text>
    </Text>
  )
}

export default HabitsEmpty