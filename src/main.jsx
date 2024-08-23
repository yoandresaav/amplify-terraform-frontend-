import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import ListFiles from './ListFiles.jsx'
import { ChakraProvider } from '@chakra-ui/react'

import {Amplify} from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';

import '@aws-amplify/ui-react/styles.css';

import awsExports from './aws-exports';
Amplify.configure(awsExports);

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/list",
    element: <ListFiles />,
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Authenticator>
    <ChakraProvider>
      <RouterProvider router={router} />
    </ChakraProvider>
    </Authenticator>
  </StrictMode>,
)
