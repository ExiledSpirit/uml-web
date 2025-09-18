import { Theme } from '@radix-ui/themes'
import Home from '@/pages/page'
import '@/styles/diagram.css';

function App() {
  return (
    <Theme className='font-bricolage h-screen w-screen' accentColor='green' appearance='light' radius='none'>
      <Home></Home>      
    </Theme>
  )
}

export default App
