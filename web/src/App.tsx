import Header from './components/Header'
import './lib/dayjs'
import SummaryTable from './components/SummaryTable'
import './styles/global.css'
import { api } from './lib/axios'

/* After --> Notifications Push */
// 1. Local Notification => Problems: Scheduling / App fechado
/*
  window.Notification.requestPermission(permission => {
    if(permission === 'granted') {
      new window.Notification('Habits', {
        body: 'Testando, Testando ...'
      })
    }
  })
*/

// 2. Services Workers
navigator.serviceWorker.register('service-worker.js')
  .then(async (serviceWorker) => {
    // Assinatura
    let subscription = await serviceWorker.pushManager.getSubscription()

    if(!subscription) {
      const { data } = await api.get('/push/public_key')

      subscription = await serviceWorker.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: data.publicKey
      })
    }
    
    await api.post('/push/register', {
      subscription
    })

    await api.post('/push/send', {
      subscription
    })
  })

function App() {


  return (
    <div className='w-screen h-screen flex justify-center items-center'>
      <div className='w-full max-w-5xl px-6 flex flex-col gap-16'>
        <Header />

        <SummaryTable />
      </div>
    </div>
  )
}

export default App
