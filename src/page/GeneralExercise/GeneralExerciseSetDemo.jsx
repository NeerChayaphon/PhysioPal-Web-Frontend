import {
  Flex,
  VStack,
  Grid,
  GridItem,
  Text,
  Image,
  Center,
  Button,
} from '@chakra-ui/react';
import React from 'react';
import {FaPlay} from 'react-icons/fa';
import Navbar from '../../component/navbar';

const GeneralExerciseSetDemo = () => {
  return (
    <>
      <Navbar />
      <Flex alignItems='flex-start' flexDir='column' m={8}>
        <Text textColor='black' fontWeight='bold' fontSize='xl' mb={4}>
          Exercise 1
        </Text>
        <VStack
          w='full'
          borderTopRadius='md'
          alignItems='flex-start'
          bg='gray.50'
          p={4}
        >
          <Text mb={2}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Non
            convallis venenatis nam dignissim tortor integer imperdiet dignissim
            ac. Urna aenean cras eget orci, augue nisl nunc, vitae odio. Tellus
            tincidunt facilisi dui nisi, volutp
          </Text>
          <Grid w='100%' templateColumns='repeat(3, 1fr)' gap={6}>
            <GridItem w='100%'>
              <Flex
                flexDir='column'
                alignItems='start'
                borderTop='4px'
                borderTopColor='blue.500'
              >
                <Text
                  fontSize='sm'
                  fontWeight='semibold'
                  color='blue.500'
                  pt={3}
                >
                  STEP 1
                </Text>
                <Text color='gray.700' fontSize='sm'>
                  Title of this step
                </Text>
              </Flex>
            </GridItem>
            <GridItem w='100%'>
              <Flex
                flexDir='column'
                alignItems='start'
                borderTop='4px'
                borderTopColor='gray.300'
              >
                <Text
                  fontSize='sm'
                  fontWeight='semibold'
                  color='gray.500'
                  pt={3}
                >
                  STEP 2
                </Text>
                <Text color='gray.500' fontSize='sm'>
                  Title of this step
                </Text>
              </Flex>
            </GridItem>
            <GridItem w='100%'>
              <Flex
                flexDir='column'
                alignItems='start'
                borderTop='4px'
                borderTopColor='gray.300'
              >
                <Text
                  fontSize='sm'
                  fontWeight='semibold'
                  color='gray.500'
                  pt={3}
                >
                  STEP 3
                </Text>
                <Text color='gray.500' fontSize='sm'>
                  Title of this step
                </Text>
              </Flex>
            </GridItem>
          </Grid>
        </VStack>
        {/* <HStack w='full' alignItems='flex-start' bg='blue.50'>

      </HStack> */}
        <Grid w='100%' templateColumns='4fr 8fr' h='xl'>
          <GridItem
            w='100%'
            bgColor='gray.100'
            justifyContent='center'
            display='flex'
            alignItems='center'
          >
            <Image
              boxSize='max-content'
              objectFit='cover'
              src='https://cdni.iconscout.com/illustration/premium/thumb/bridge-pose-3503127-2965793.png'
              alt='Dan Abramov'
            />
          </GridItem>
          <GridItem
            w='100%'
            bgColor='gray.200'
            justifyContent='center'
            display='flex'
            flexDir='column'
            alignItems='center'
          >
            <Text fontSize='2xl' fontWeight='bold' mb={5}>
              Let's start exercising
            </Text>
            <Button color='white' bgColor='teal.400' leftIcon={<FaPlay />}>
              {' '}
              Start
            </Button>
          </GridItem>
        </Grid>
      </Flex>
    </>
  );
};

export default GeneralExerciseSetDemo;
