import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { fetchUserProfile } from '../services/userService';
import Layout from './Layout';
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  HStack,
  Stack,
  useColorModeValue,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Divider,
} from '@chakra-ui/react';

interface Expense {
  payerId: string;
  amount: number;
  description: string;
  date: any;
}

interface Settlement {
  fromUserId: string;
  reason: string;
  amount: number;
  date: any;
}

interface UserProfile {
  displayName: string;
}

export default function GroupDetail() {
  const { groupId } = useParams();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [totalOwed, setTotalOwed] = useState<number>(0);
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({});
  const navigate = useNavigate();
  const cardBg = useColorModeValue('whiteAlpha.800', 'whiteAlpha.100');
  const accent = useColorModeValue('purple.600', 'purple.300');

  useEffect(() => {
    if (!groupId || !auth.currentUser?.uid) return;

    const expensesRef = collection(db, 'groups', groupId, 'expenses');
    const settlementsRef = collection(db, 'groups', groupId, 'settlements');

    const unsubExpenses = onSnapshot(expensesRef, snapshot => {
      const data: Expense[] = snapshot.docs.map(doc => doc.data() as Expense);
      setExpenses(data);
      fetchUserProfiles(data.map(e => e.payerId));
    });

    const unsubSettlements = onSnapshot(settlementsRef, snapshot => {
      const data: Settlement[] = snapshot.docs.map(doc => doc.data() as Settlement);
      setSettlements(data);
    });

    return () => {
      unsubExpenses();
      unsubSettlements();
    };
  }, [groupId]);

  useEffect(() => {
    if (!auth.currentUser?.uid) return;
    const uid = auth.currentUser.uid;

    const totalExpenses = expenses.reduce((sum, exp) => {
      return exp.payerId === uid ? sum + exp.amount : sum;
    }, 0);

    const totalSettlements = settlements.reduce((sum, s) => {
      return s.fromUserId === uid ? sum + s.amount : sum;
    }, 0);

    setTotalOwed(totalExpenses - totalSettlements);
  }, [expenses, settlements]);

  const fetchUserProfiles = async (userIds: string[]) => {
    const newProfiles: Record<string, UserProfile> = { ...userProfiles };
    for (const uid of userIds) {
      if (!newProfiles[uid]) {
        const profile = await fetchUserProfile(uid);
        if (profile) {
          newProfiles[uid] = profile;
        }
      }
    }
    setUserProfiles(newProfiles);
  };

  const formatUser = (uid: string): string => {
    if (uid === auth.currentUser?.uid) return 'You';
    return userProfiles[uid]?.displayName || uid;
  };

  return (
    <Layout>
      <Box maxW="5xl" mx="auto" py={8}>
        <Heading size="lg" color={accent} mb={8}>
          Group: {groupId}
        </Heading>

        <Stack direction={{ base: 'column', md: 'row' }} spacing={8} mb={8}>
          <Card flex={1} bg={cardBg} boxShadow="lg" borderRadius="xl">
            <CardHeader>
              <Heading size="md">Expenses</Heading>
            </CardHeader>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                {expenses.length === 0 ? (
                  <Text color="gray.400">No expenses yet.</Text>
                ) : (
                  expenses.map((e, idx) => (
                    <Box key={idx} p={3} borderRadius="md" bg="purple.900" color="whiteAlpha.900">
                      <Text fontWeight="bold">{e.description}</Text>
                      <Text>
                        ${e.amount.toFixed(2)} paid by <Badge colorScheme="purple">{formatUser(e.payerId)}</Badge>
                      </Text>
                    </Box>
                  ))
                )}
              </VStack>
            </CardBody>
          </Card>

          <Card flex={1} bg={cardBg} boxShadow="lg" borderRadius="xl">
            <CardHeader>
              <Heading size="md">Settlements</Heading>
            </CardHeader>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                {settlements.length === 0 ? (
                  <Text color="gray.400">No settlements yet.</Text>
                ) : (
                  settlements.map((s, idx) => (
                    <Box key={idx} p={3} borderRadius="md" bg="green.900" color="whiteAlpha.900">
                      <Text>
                        <Badge colorScheme="green">{formatUser(s.fromUserId)}</Badge> paid ${s.amount.toFixed(2)} for "{s.reason}" on {new Date(s.date.seconds * 1000).toLocaleDateString()}
                      </Text>
                    </Box>
                  ))
                )}
              </VStack>
            </CardBody>
          </Card>
        </Stack>

        <Card bg={cardBg} boxShadow="lg" mb={8} borderRadius="xl">
          <CardHeader>
            <Heading size="md">Total You're Owed</Heading>
          </CardHeader>
          <CardBody>
            <Text fontSize="2xl" fontWeight="bold" color={totalOwed < 0 ? 'red.400' : 'green.400'}>
              ${totalOwed.toFixed(2)}
            </Text>
          </CardBody>
        </Card>

        <Divider mb={8} />

        <HStack spacing={4}>
          <Button colorScheme="purple" onClick={() => navigate(`/groups/${groupId}/add`)}>
            Add Expense
          </Button>
          <Button colorScheme="purple" variant="outline" onClick={() => navigate(`/groups/${groupId}/settle`)}>
            Settle Up
          </Button>
          <Button onClick={() => navigate('/')}>Exit</Button>
        </HStack>
      </Box>
    </Layout>
  );
}
