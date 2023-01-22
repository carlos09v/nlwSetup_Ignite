import { useNavigation, useFocusEffect } from "@react-navigation/native"
import dayjs from "dayjs"
import { useCallback, useState } from "react"
import { View, Text, ScrollView, Alert } from "react-native"
import HabitDay from "../components/HabitDay"
import { DAY_SIZE } from "../components/HabitDay"
import Header from "../components/Header"
import Loading from "../components/Loading"
import { api } from "../lib/axios"
import { generateDatesFromYearBeginning } from "../utils/generate-range-between-dates"

const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
const datesFromYearStart = generateDatesFromYearBeginning()
// Minimo de Dias pra preencher
const minimunSummaryDatesSizes = 18 * 5
const amountOfDaysToFill = minimunSummaryDatesSizes - datesFromYearStart.length

type SummaryProps = {
    id: string
    date: string
    amount: number
    completed: number
}[]

const Home = () => {
    const { navigate } = useNavigation()
    const [loading, setLoading] = useState(true)
    const [summary, setSummary] = useState<SummaryProps | null>(null)

    const fetchData = async () => {
        try {
            setLoading(true)

            const { data } = await api.get('/summary')
            setSummary(data)
        } catch (error) {
            Alert.alert('Ops', 'Não foi possivel carregar o sumário de hábitos!')
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    // Atualizar a tela ao ter foco
    useFocusEffect(useCallback(() => {
        fetchData()
    }, []))


    if (loading) return <Loading />

    return (
        <View className="flex-1 bg-background px-8 pt-16">
            <Header />


            <View className="flex-row mt-6 mb-2">
                {weekDays.map((weekDay, i) => (
                    <Text key={`${weekDay}-${i}`} className="text-zinc-400 text-xl font-bold text-center mx-1" style={{ width: DAY_SIZE }}>
                        {weekDay}
                    </Text>
                ))}
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {
                    summary && (
                        <View className="flex-row flex-wrap">
                            {datesFromYearStart.map(date => {
                                const dayWithHabits = summary.find(day => {
                                    return dayjs(date).isSame(day.date)
                                })

                                return (
                                    <HabitDay key={date.toISOString()} onPress={() => navigate('habit', { date: date.toISOString() })} date={date} amountOfHabits={dayWithHabits?.amount} amountCompleted={dayWithHabits?.completed} />
                                )
                            })}

                            {amountOfDaysToFill > 0 && Array.from({ length: amountOfDaysToFill }).map((_, i) => (
                                <View key={i} className="bg-zinc-900 rounded-lg border-2 m-1 border-zinc-800 opacity-40" style={{ width: DAY_SIZE, height: DAY_SIZE }} />
                            ))}
                        </View>
                    )
                }
            </ScrollView>

        </View>
    )
}

export default Home