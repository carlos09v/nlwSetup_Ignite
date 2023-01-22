import { FastifyInstance } from 'fastify'
import { prisma } from "./lib/prisma";
import { z } from 'zod'
import dayjs from 'dayjs';

export const appRoutes = async (app: FastifyInstance) => {
    /*
        app.get('/hello', async () => {
            const habits = await prisma.habit.findMany()

            return habits
        })
    */

    // Create Habit
    app.post('/habits', async(req) => {
        const createHabitBody = z.object({
            title: z.string(),
            weekDays: z.array(
                z.number().min(0).max(6)
            )
        })
        const { title, weekDays } = createHabitBody.parse(req.body)

        const today = dayjs().startOf('day').toDate()
        // startOf => Zera as horas/minutos/segundos

        await prisma.habit.create({
            data: {
                title,
                created_at: today,
                habitWeekDays: {
                    create: weekDays.map(weekDay => {
                        return {
                            week_day: weekDay
                        }
                    })
                }
            }
        })
    })

    // Get Day
    app.get('/day', async (req) => {
        const getDayParams = z.object({
            date: z.coerce.date() // Converter string pra Date => new Date(param)
        })
        // localhost:3333/day?date=2022-01-13T00:00
        const { date } = getDayParams.parse(req.query)

        // Dia da Semana
        const parsedDate = dayjs(date).startOf('day')
        const weekDay = parsedDate.get('day')

        // Todos hábitos possíveis
        // E todos hábitos completados
        const possibleHabits = await prisma.habit.findMany({
            where: {
                created_at: {
                    lte: date // <= menor ou igual a data atual
                },
                habitWeekDays: {
                    some: {
                        week_day: weekDay
                    }
                }
            }
        })

        // Hábitos completados
        const day = await prisma.day.findUnique({
            where: {
                date: parsedDate.toDate()
            },
            include: {
                dayHabits: true
            }
        })
        const completedHabits = day?.dayHabits.map(dayHabit => {
            return dayHabit.habit_id
        }) ?? []

        return { possibleHabits, completedHabits }
    })

    // Toggle Complete/Not Completed
    app.patch('/habits/:id/toggle', async (req) => {
        const toggleHabitParams = z.object({
            id: z.string().uuid()
        })
        const { id } = toggleHabitParams.parse(req.params)

        // Acompanhamento DIÁRIO (ñ é possivel completar habito de dia passado. Obs: Apenas na data atual)
        const today = dayjs().startOf('day').toDate()
        let day = await prisma.day.findUnique({
            where: {
                date: today
            }
        })

        if(!day) {
            day = await prisma.day.create({
                data: {
                    date: today
                }
            })
        }

        const dayHabit = await prisma.dayHabit.findUnique({
            where: {
                day_id_habit_id: {
                    day_id: day.id,
                    habit_id: id
                }
            }
        })
        // Se ja tinha marcado completo
        if(dayHabit) {
            // Remover
            await prisma.dayHabit.delete({
                where: {
                    id: dayHabit.id
                }
            })
        }else {
            // Esta marcando pela primeira vez
            await prisma.dayHabit.create({
                data: {
                    day_id: day.id,
                    habit_id: id
                }
            })
        }
    })

    // Resumo
    app.get('/summary', async (req) => {
        // Query mais complexa, mais condições, relacionamentos => SQL na mão (RAW)
        // Prisma ORM: RAW SQL => SQLite
 
        const summary = await prisma.$queryRaw`
            SELECT D.id, D.date,
                ( 
                    -- Sub Queries => SELECT dentro de outro
                    SELECT cast(count(*) as float) -- Converter Big Int to float
                        FROM day_habits DH
                            WHERE DH.day_id = D.id
                ) as completed,
                (
                    SELECT cast(count(*) as float)
                        FROM habit_week_days HWD
                        JOIN habits H
                            ON H.id = HWD.habit_id
                        WHERE HWD.week_day = cast(strftime('%w', D.date/1000.0, 'unixepoch') as int) -- formata uma data
                            AND H.created_at <= D.date
                )as amount
            FROM days D
        `

        return summary
    })

}