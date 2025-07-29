import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';
import {
  Box,
  Button,
  Heading,
  Input,
  Text,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useColorModeValue,
  Card,
  CardBody,
  CardHeader,
  VStack,
} from '@chakra-ui/react';

export default function CreateGroup() {
  const [groupName, setGroupName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const cardBg = useColorModeValue('whiteAlpha.800', 'whiteAlpha.100');

  const handleCreate = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    if (!groupName.trim()) {
      setError('Group name cannot be empty.');
      return;
    }

    try {
      await addDoc(collection(db, 'groups'), {
        groupName,
        memberIds: [userId],
      });
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Layout>
      <Box maxW="lg" mx="auto" py={12}>
        <Card bg={cardBg} boxShadow="lg" borderRadius="xl">
          <CardHeader>
            <Heading size="lg">Create a Group</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <FormControl isInvalid={!!error && !groupName.trim()}>
                <FormLabel>Group Name</FormLabel>
                <Input
                  type="text"
                  placeholder="Group Name"
                  value={groupName}
                  onChange={e => setGroupName(e.target.value)}
                />
                <FormErrorMessage>{error}</FormErrorMessage>
              </FormControl>
              <Box>
                <Button colorScheme="purple" mr={4} onClick={handleCreate}>Create Group</Button>
                <Button variant="outline" onClick={() => navigate('/')}>Exit</Button>
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </Box>
    </Layout>
  );
}
