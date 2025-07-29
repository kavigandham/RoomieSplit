import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
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

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function JoinGroup() {
  const [groupId, setGroupId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();
  const query = useQuery();
  const cardBg = useColorModeValue('whiteAlpha.800', 'whiteAlpha.100');

  // Pre-fill groupId from query param if present
  useState(() => {
    const id = query.get('groupId');
    if (id) setGroupId(id);
  });

  const handleJoin = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId || !groupId.trim()) {
      setError('Missing group ID or not logged in.');
      return;
    }
    try {
      const groupRef = doc(collection(db, 'groups'), groupId.trim());
      const groupSnap = await getDoc(groupRef);
      if (!groupSnap.exists()) {
        setError('Group not found.');
        return;
      }
      await updateDoc(groupRef, {
        memberIds: arrayUnion(userId),
      });
      setSuccess('Successfully joined the group!');
      setError(null);
      setTimeout(() => navigate('/'), 1500);
    } catch (err: any) {
      setError(err.message);
      setSuccess(null);
    }
  };

  return (
    <Layout>
      <Box maxW="lg" mx="auto" py={12}>
        <Card bg={cardBg} boxShadow="lg" borderRadius="xl">
          <CardHeader>
            <Heading size="lg">Join a Group</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <FormControl isInvalid={!!error && !groupId.trim()}>
                <FormLabel>Group ID</FormLabel>
                <Input
                  type="text"
                  placeholder="Enter Group ID"
                  value={groupId}
                  onChange={e => setGroupId(e.target.value)}
                />
                <FormErrorMessage>{error}</FormErrorMessage>
              </FormControl>
              {success && <Text color="green.400">{success}</Text>}
              <Box>
                <Button colorScheme="purple" mr={4} onClick={handleJoin}>Join Group</Button>
                <Button variant="outline" onClick={() => navigate('/')}>Exit</Button>
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </Box>
    </Layout>
  );
}
