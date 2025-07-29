import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { Link, useNavigate } from 'react-router-dom';
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

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const cardBg = useColorModeValue('whiteAlpha.800', 'whiteAlpha.100');

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
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
            <Heading size="lg">Login to RoomieSplit</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <FormControl isInvalid={!!error && !email}>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </FormControl>
              <FormControl isInvalid={!!error && !password}>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <FormErrorMessage>{error}</FormErrorMessage>
              </FormControl>
              <Box>
                <Button colorScheme="purple" mr={4} onClick={handleLogin}>Log In</Button>
              </Box>
              <Text>
                Don’t have an account?{' '}
                <Button as={Link} to="/register" variant="link" colorScheme="purple">
                  Register
                </Button>
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </Box>
    </Layout>
  );
}
