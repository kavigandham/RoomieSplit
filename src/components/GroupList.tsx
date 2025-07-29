import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
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
  useToast,
  Card,
  CardBody,
  CardHeader,
  Divider,
  SimpleGrid,
  Avatar,
  Icon,
} from '@chakra-ui/react';
import { FaUsers, FaMoneyBillWave, FaChartLine } from 'react-icons/fa';

interface Group {
  id: string;
  groupName: string;
  memberIds: string[];
}

interface Expense {
  id?: string;
  payerId: string;
  amount: number;
  description: string;
  date: any;
}

interface Settlement {
  id?: string;
  fromUserId: string;
  amount: number;
  reason: string;
  date: any;
}

interface ActivityItem {
  type: 'expense' | 'settlement';
  groupName: string;
  description: string;
  amount: number;
  date: any;
}

export default function GroupList() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [totalOwed, setTotalOwed] = useState<number>(0);
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [allSettlements, setAllSettlements] = useState<Settlement[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [largestExpense, setLargestExpense] = useState<Expense | null>(null);
  const navigate = useNavigate();
  const toast = useToast();
  const cardBg = useColorModeValue('whiteAlpha.800', 'whiteAlpha.100');
  const accent = useColorModeValue('purple.600', 'purple.300');

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const fetchGroupsAndData = async () => {
      const groupsRef = collection(db, 'groups');
      const q = query(groupsRef, where('memberIds', 'array-contains', userId));
      const snapshot = await getDocs(q);
      const fetchedGroups = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Group, 'id'>),
      }));
      setGroups(fetchedGroups);
      await computeAnalytics(fetchedGroups, userId);
    };

    fetchGroupsAndData();
  }, []);

  const computeAnalytics = async (groups: Group[], userId: string) => {
    let total = 0;
    let expenses: Expense[] = [];
    let settlements: Settlement[] = [];
    let activity: ActivityItem[] = [];
    let maxExpense: Expense | null = null;

    for (const group of groups) {
      const expensesRef = collection(db, 'groups', group.id, 'expenses');
      const settlementsRef = collection(db, 'groups', group.id, 'settlements');

      const [expensesSnap, settlementsSnap] = await Promise.all([
        getDocs(expensesRef),
        getDocs(settlementsRef)
      ]);

      expensesSnap.forEach(doc => {
        const data = doc.data() as Expense;
        const expense: Expense = { ...data, id: doc.id };
        expenses.push(expense);
        if (data.payerId === userId) {
          total += data.amount;
        }
        // Activity feed
        activity.push({
          type: 'expense',
          groupName: group.groupName,
          description: data.description,
          amount: data.amount,
          date: data.date,
        });
        // Largest expense
        if (!maxExpense || data.amount > maxExpense.amount) {
          maxExpense = expense;
        }
      });

      settlementsSnap.forEach(doc => {
        const data = doc.data() as Settlement;
        const settlement: Settlement = { ...data, id: doc.id };
        settlements.push(settlement);
        if (data.fromUserId === userId) {
          total -= data.amount;
        }
        // Activity feed
        activity.push({
          type: 'settlement',
          groupName: group.groupName,
          description: data.reason,
          amount: data.amount,
          date: data.date,
        });
      });
    }

    // Sort activity by date (most recent first)
    activity.sort((a, b) => (b.date?.seconds || 0) - (a.date?.seconds || 0));

    setTotalOwed(total);
    setAllExpenses(expenses);
    setAllSettlements(settlements);
    setRecentActivity(activity.slice(0, 5)); // Show 5 most recent
    setLargestExpense(maxExpense);
  };

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  const handleInvite = (groupId: string) => {
    const inviteUrl = `${window.location.origin}/join?groupId=${groupId}`;
    navigator.clipboard.writeText(inviteUrl);
    toast({
      title: 'Invite link copied!',
      description: inviteUrl,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Layout>
      <Box maxW="6xl" mx="auto" py={8}>
        {/* Dashboard Widgets */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
          <Card bg={cardBg} boxShadow="lg" borderRadius="xl">
            <CardBody>
              <HStack>
                <Icon as={FaUsers} boxSize={8} color={accent} />
                <Box>
                  <Text fontSize="sm" color="gray.400">Total Groups</Text>
                  <Heading size="md">{groups.length}</Heading>
                </Box>
              </HStack>
            </CardBody>
          </Card>
          <Card bg={cardBg} boxShadow="lg" borderRadius="xl">
            <CardBody>
              <HStack>
                <Icon as={FaMoneyBillWave} boxSize={8} color={accent} />
                <Box>
                  <Text fontSize="sm" color="gray.400">Largest Expense</Text>
                  <Heading size="md">
                    {largestExpense ? `$${largestExpense.amount.toFixed(2)}` : '--'}
                  </Heading>
                  <Text fontSize="xs" color="gray.500">
                    {largestExpense ? largestExpense.description : ''}
                  </Text>
                </Box>
              </HStack>
            </CardBody>
          </Card>
          <Card bg={cardBg} boxShadow="lg" borderRadius="xl">
            <CardBody>
              <HStack>
                <Icon as={FaChartLine} boxSize={8} color={accent} />
                <Box>
                  <Text fontSize="sm" color="gray.400">Total You're Owed</Text>
                  <Heading size="md" color={totalOwed < 0 ? 'red.400' : 'green.400'}>
                    ${totalOwed.toFixed(2)}
                  </Heading>
                </Box>
              </HStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Recent Activity Feed */}
        <Card bg={cardBg} boxShadow="lg" mb={8} borderRadius="xl">
          <CardHeader>
            <Heading size="md">Recent Activity</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={3}>
              {recentActivity.length === 0 ? (
                <Text color="gray.400">No recent activity.</Text>
              ) : (
                recentActivity.map((item, idx) => (
                  <Box key={idx} p={2} borderRadius="md" bg={item.type === 'expense' ? 'purple.900' : 'green.900'} color="whiteAlpha.900">
                    <Text fontWeight="bold">
                      {item.type === 'expense' ? 'Expense' : 'Settlement'} in {item.groupName}
                    </Text>
                    <Text fontSize="sm">
                      {item.description} — ${item.amount.toFixed(2)} on {item.date?.seconds ? new Date(item.date.seconds * 1000).toLocaleDateString() : ''}
                    </Text>
                  </Box>
                ))
              )}
            </VStack>
          </CardBody>
        </Card>

        <Divider mb={8} />

        {groups.length === 0 ? (
          <Text color="gray.400" fontSize="lg">No groups yet.</Text>
        ) : (
          <VStack spacing={6} align="stretch">
            {groups.map(group => (
              <Card key={group.id} bg={cardBg} boxShadow="md" borderRadius="lg" p={4}>
                <HStack justify="space-between">
                  <Box>
                    <Heading size="md" color={accent}>{group.groupName}</Heading>
                    <Badge colorScheme="purple" mt={2}>
                      {group.memberIds.length} members
                    </Badge>
                  </Box>
                  <HStack>
                    <Button colorScheme="purple" variant="solid" onClick={() => navigate(`/groups/${group.id}`)}>
                      View
                    </Button>
                    <Button colorScheme="purple" variant="outline" onClick={() => handleInvite(group.id)}>
                      Invite
                    </Button>
                  </HStack>
                </HStack>
              </Card>
            ))}
          </VStack>
        )}
      </Box>
    </Layout>
  );
}
