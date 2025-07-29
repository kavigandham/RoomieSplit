import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { addDoc, collection } from 'firebase/firestore';
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

export default function AddExpense() {
  const { groupId } = useParams();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const cardBg = useColorModeValue('whiteAlpha.800', 'whiteAlpha.100');

  const handleAdd = async () => {
    const payerId = auth.currentUser?.uid;
    const amt = parseFloat(amount);
    if (!groupId || !payerId || isNaN(amt)) {
      setError('Missing data or invalid amount');
      return;
    }

    try {
      await addDoc(collection(db, 'groups', groupId, 'expenses'), {
        description,
        amount: amt,
        payerId,
        splitWith: [payerId],
        date: new Date(),
      });
      navigate(`/groups/${groupId}`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Layout>
      <Box maxW="lg" mx="auto" py={12}>
        <Card bg={cardBg} boxShadow="lg" borderRadius="xl">
          <CardHeader>
            <Heading size="lg">Add Expense</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <FormControl isInvalid={!!error && !description}>
                <FormLabel>Description</FormLabel>
                <Input
                  type="text"
                  placeholder="Description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </FormControl>
              <FormControl isInvalid={!!error && (isNaN(parseFloat(amount)) || !amount)}>
                <FormLabel>Amount</FormLabel>
                <Input
                  type="number"
                  placeholder="Amount"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                />
                <FormErrorMessage>{error}</FormErrorMessage>
              </FormControl>
              <Box>
                <Button colorScheme="purple" mr={4} onClick={handleAdd}>Add</Button>
                <Button variant="outline" onClick={() => navigate(`/groups/${groupId}`)}>Exit</Button>
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </Box>
    </Layout>
  );
}