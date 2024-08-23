import { Flex } from '@chakra-ui/react';
import Dashboard from './Dashboard';
import SidebarLeft from "./SidebarLeft";


function App() {

  return (
    <Flex>
      <SidebarLeft />
      <Dashboard />
    </Flex>
  )
}

export default App
