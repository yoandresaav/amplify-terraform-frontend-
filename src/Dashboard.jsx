import { useEffect, useRef } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useState } from 'react';
import { useToast } from '@chakra-ui/react';
import axios from 'axios';
import { Slider, SliderTrack, SliderFilledTrack, SliderThumb, SliderMark } from '@chakra-ui/react';
import {
  Box,
  Progress,
  List,
  ListItem,
  Icon,
  Stack,
  FormControl,
  Input,
  Button,
  useColorModeValue,
  Heading,
  Text,
  Container,
  Flex,
  CloseButton,
  HStack,
} from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';
import { FiFile } from 'react-icons/fi';
import { divideInChunks } from './utils';
import useJwtToken from './useJwtToken';

export default function Dashboard() {
  const toast = useToast();
  const toastIdRef = useRef();

  const [files, setFiles] = useState([]);
  // <'initial' | 'submitting' | 'success'>
  const [state, setState] = useState('initial');
  const [error, setError] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { user } = useAuthenticator((context) => [context.user]);
  // custom hook to fetch jwt token
  const { accessToken: jwtToken, loading: loadingJwt, error: errorJwt } = useJwtToken();

  // Divide files in chunks
  const handleFileChange = (e) => {
    const _files = Array.from(e.target.files);
    const allChunks = _files.map((file) => divideInChunks(file, sliderValue));
    setFiles([...files, ...allChunks.flat()]);
  };

  useEffect(() => {
    if (errorJwt) {
      toast({
        title: 'Error',
        description: 'An error occured while fetching jwt token.',
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    }
  }, [errorJwt, toast]);


  // Delete individual file from list
  const handleDeleteFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
  };

  const callJoinChunksFunction = async (files_name) => {
    /// Call join chunks function
    toastIdRef.current = toast({
      title: 'Joining chunks',
      status: 'loading',
      description: 'We are in process',
    });

    const data = {
      files_name,
      total_chunks: files_name.length,
      folder: user.userId,
    };
    let response;

    try {
      response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}`, data, {
        headers: {
          Authorization: `${jwtToken}`,
        },
      });
    } catch (e) {
      console.error({ e });
      toast.update(toastIdRef.current, {
        title: 'Error joining chunks',
        status: 'error',
        description: 'An error occured while joining chunks.',
        duration: 9000,
        isClosable: true,
      });
      return;
    }

    if (response.status !== 200) {
      console.error({ response });
      toast.update(toastIdRef.current, {
        title: 'Error joining chunks',
        status: 'error',
        description: 'An error occured while joining chunks.',
        duration: 9000,
        isClosable: true,
      });
      return;
    }

    // All ok Notitifation
    toast.update(toastIdRef.current, {
      title: 'File joined successfully',
      status: 'success',
      description: 'Your file has been joined successfully.',
      duration: 9000,
      isClosable: true,
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    // initialize
    setError(false);
    setState('submitting');
    setUploadProgress(Array(files.length).fill(0));

    // Create a list of files with their url
    const listFiles = await Promise.all(
      files.map(async (file, index) => {
        return {
          url: `${import.meta.env.VITE_BACKEND_URL}/${user.userId}/${file.name}`,
          file,
          index,
        };
      })
    );

    // get all fetchs
    const fetchs = listFiles.map((oneFile) =>
      axios.put(oneFile.url, oneFile.file, {
        headers: {
          Authorization: `${jwtToken}`,
          'Content-Type': oneFile.file.type,
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          setUploadProgress((prevProgress) => {
            const newProgress = [...prevProgress];
            newProgress[oneFile.index] = progress;
            return newProgress;
          });
        },
      })
    );

    // Send all files
    let responses;
    try {
      responses = await Promise.all(fetchs);
    } catch (e) {
      console.error({ e });
      setError(true);
      setState('initial');
      toast({
        title: 'Error',
        description: 'An error occured while uploading files.',
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    }
    const allOkResponses = responses.every((response) => response.status === 200);

    if (!allOkResponses) {
      setError(true);
      setState('initial');
      throw new Error('Failed to upload file');
    }

    // All ok Notitifation
    toast({
      title: 'File(s) uploaded.',
      description: 'Your file(s) have been uploaded successfully.',
      status: 'success',
      isClosable: true,
    });
    setState('success');

    // Call join chunks function
    callJoinChunksFunction(files.map((file) => file.name));

    // Clean
    setTimeout(() => {
      setState('initial');
      setUploadProgress(0);
      setFiles([]);
    }, 3500);
  };

  const [sliderValue, setSliderValue] = useState(500);

  const labelStyles = {
    mt: '2',
    ml: '-2.5',
    fontSize: 'sm',
  };

  return (
    <Flex
      minH={'100vh'}
      w={'full'}
      align={'center'}
      justify={'center'}
      bg={useColorModeValue('gray.100', 'gray.800')}
    >
      <Container
        maxW={'container.md'}
        bg={useColorModeValue('white', 'whiteAlpha.100')}
        boxShadow={'xl'}
        rounded={'lg'}
        p={6}
      >
        <Heading as={'h2'} fontSize={{ base: 'xl', sm: '2xl' }} textAlign={'center'} mb={5}>
          Upload some files
        </Heading>

        <Box p={10}>
          <Slider
            disabled={files.length > 0}
            aria-label="slider-ex-6"
            onChange={(val) => setSliderValue(val)}
            min={100}
            max={1024}
          >
            <SliderMark value={100} {...labelStyles}>
              100KB
            </SliderMark>
            <SliderMark value={500} {...labelStyles}>
              500KB
            </SliderMark>
            <SliderMark value={1024} {...labelStyles}>
              1024KB
            </SliderMark>
            <SliderMark
              value={sliderValue}
              textAlign="center"
              bg="blue.500"
              color="white"
              mt="-10"
              ml="-5"
              w="12"
            >
              {sliderValue}K
            </SliderMark>
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
        </Box>

        <Stack
          direction={{ base: 'column', md: 'row' }}
          as={'form'}
          spacing={'12px'}
          onSubmit={onSubmit}
        >
          <FormControl>
            <Input
              type="file"
              multiple
              onChange={handleFileChange}
              style={{ display: 'none' }}
              id="file-upload"
              required
              disabled={state !== 'initial'}
              borderColor={useColorModeValue('gray.300', 'gray.700')}
              borderWidth={1}
              variant={'solid'}
            />
            <Button as="label" htmlFor="file-upload" colorScheme="yellow" cursor="pointer" disabled={ errorJwt || loadingJwt } >
              Choose Files
            </Button>
          </FormControl>

          <FormControl w={{ base: '100%', md: '40%' }}>
            <Button
              colorScheme={state === 'success' ? 'green' : 'blue'}
              isLoading={state === 'submitting'}
              w="100%"
              isDisabled={files.length === 0}
              type={state === 'success' ? 'button' : 'submit'}
            >
              {state === 'success' ? <CheckIcon /> : 'Submit'}
            </Button>
          </FormControl>
        </Stack>
        <Text mt={2} textAlign={'center'} color={error ? 'red.500' : 'gray.500'}>
          {error
            ? 'Oh no an error occured! 😢 Please try again later.'
            : `Uploading ${files.length} file(s)...`}
        </Text>

        {files.length > 0 && (
          <Box w="100%">
            <Text mb={2}>Selected file(s):</Text>
            <List spacing={2} mb={4}>
              {files.map((file, index) => (
                <div key={index}>
                  <ListItem
                    key={index}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <HStack>
                      <Icon as={FiFile} />
                      <Text>
                        {file.name} (<TotalSize size={file.size} />)
                      </Text>
                    </HStack>
                    <CloseButton onClick={() => handleDeleteFile(index)} />
                  </ListItem>
                  <Progress value={uploadProgress[index]} size="sm" colorScheme="blue" />
                </div>
              ))}
            </List>
            <Text>Uploading {files.length} file(s)...</Text>
          </Box>
        )}
      </Container>
    </Flex>
  );
}

const TotalSize = ({ size }) => {
  let fSExt = new Array('Bytes', 'KB', 'MB', 'GB'),
    i = 0;
  while (size > 900) {
    size /= 1024;
    i++;
  }
  var exactSize = Math.round(size * 100) / 100 + ' ' + fSExt[i];
  return <span>{exactSize}</span>;
};
