import { useRef } from 'react';
import { useState, useEffect } from 'react';
import { List, ListItem, ListIcon, Spacer } from '@chakra-ui/react';
import {
  Square,
  Flex,
  Box,
  Button,
  VStack,
  Text,
  Center,
  useColorModeValue,
  CircularProgress,
} from '@chakra-ui/react';
import { DownloadIcon } from '@chakra-ui/icons';
import useJwtToken from './useJwtToken';
import { useToast } from '@chakra-ui/react';
import SidebarLeft from './SidebarLeft';
import { CheckIcon } from '@chakra-ui/icons';
import { useAuthenticator } from '@aws-amplify/ui-react';
import axios from 'axios';

export default function ListFiles() {
  const [files, setFiles] = useState([]);
  const { user } = useAuthenticator((context) => [context.user]);

  const [loading, setLoading] = useState(true);

  // custom hook to fetch jwt token
  const { accessToken: jwtToken, loading: loadingJwt, error: errorJwt } = useJwtToken();

  const toast = useToast();
  const toastIdRef = useRef();

  const url = `${import.meta.env.VITE_BACKEND_URL}?folder=${user.userId}`;

  const getFilesFromGateway = async (jwtToken) => {
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `${jwtToken}`,
        },
      });
      setFiles(response.data);
    } catch (e) {
      console.error(e);
      toast({
        title: 'Error',
        description: 'An error occured while fetching files.',
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    }
    setLoading(false);
  };

  const downloadFile = async (index) => {
    const file = files[index];
    const url = `${import.meta.env.VITE_BACKEND_URL}/${user.userId}/${file}`;

    toastIdRef.current = toast({ description: 'Downloading file', status: 'loading' });

    let response;

    try {
      response = await axios.get(url, {
        headers: {
          Authorization: `${jwtToken}`,
        },
      });
    } catch (e) {
      console.error(e);
      toast.update(toastIdRef.current, { description: 'Error downloading', status: 'error' });
      return;
    }

    const base64String = response.data;
    const binaryString = atob(base64String);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);

    // Convert binary string to a byte array
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Create a Blob from the byte array
    const fileBlob = new Blob([bytes.buffer], { type: 'application/octet-stream' });

    // Create a temporary link element
    const link = document.createElement('a');
    link.href = URL.createObjectURL(fileBlob);

    // Define the name of the file to be downloaded
    link.download = file; // Replace with your desired file name and extension

    toast.update(toastIdRef.current, { description: 'Downloaded', status: 'success' });

    setTimeout(() => {
      // Trigger the download by clicking the link
      link.click();

      // Clean up the Object URL
      URL.revokeObjectURL(link.href);
    }, 1000);
  };

  useEffect(() => {
    if (!loadingJwt && jwtToken) {
      getFilesFromGateway(jwtToken);
    } else if (errorJwt) {
      console.error('Error fetching jwt token');
    }
  }, [loadingJwt, jwtToken, errorJwt]);

  return (
    <Flex bg={useColorModeValue('gray.100', 'gray.800')}>
      <SidebarLeft />
      <Flex direction={'column'} w={'full'} minWidth="max-content" alignItems="center" gap="2">
        <Center w="full" size="150px" h="100px">
          <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">
            List Files
          </Text>
        </Center>

        {loading && (
          <Square size="250px" p={10} rounded="md">
            <CircularProgress isIndeterminate color="green.300" />
          </Square>
        )}

        {!loading && files.length === 0 && (
          <Box bg="tomato" p={5} minW={450} m={10} borderWidth={1} borderRadius="md" boxShadow="md">
            <Text fontSize="2xl" color="white">
              No files found
            </Text>
          </Box>
        )}

        {!loading && files.length > 0 && (
          <Box bg="white" p={5} minW={400} m={10} borderWidth={1} borderRadius="md" boxShadow="md">
            <VStack spacing={4}>
              <List spacing={3} w="100%">
                {files.map((file, index) => (
                  <ListItem
                    key={index}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <ListIcon as={CheckIcon} color="green.500" />
                    <Text>{file}</Text> <Spacer w="120px" />
                    <Button
                      leftIcon={<DownloadIcon />}
                      colorScheme="blue"
                      variant="solid"
                      onClick={() => downloadFile(index)}
                    >
                      Download
                    </Button>
                  </ListItem>
                ))}
              </List>
            </VStack>
          </Box>
        )}
      </Flex>
    </Flex>
  );
}
