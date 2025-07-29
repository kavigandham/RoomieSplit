import { ReactNode } from 'react';
import { Box, Flex, Stack, Text, IconButton, Spacer, Avatar, useColorMode } from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { label: 'Dashboard', path: '/' },
  { label: 'Create Group', path: '/create' },
  { label: 'Join Group', path: '/join' },
];

export default function Layout({ children }: LayoutProps) {
  const { colorMode, toggleColorMode } = useColorMode();
  const navigate = useNavigate();

  return (
    <Flex minH="100vh" bgGradient="linear(to-br, #232526, #414345)">
      {/* Sidebar */}
      <Stack
        align="stretch"
        spacing={6}
        bg="rgba(26, 32, 44, 0.85)"
        boxShadow="2xl"
        p={6}
        minW="220px"
        borderRightRadius="2xl"
        backdropFilter="blur(8px)"
      >
        <Flex align="center" mb={8}>
          <Avatar name="RoomieSplit" size="md" mr={3} />
          <Text fontWeight="bold" fontSize="xl" color="white">RoomieSplit</Text>
        </Flex>
        {navItems.map(item => (
          <Box
            key={item.label}
            as="button"
            onClick={() => navigate(item.path)}
            py={2}
            px={4}
            borderRadius="md"
            _hover={{ bg: 'purple.700', color: 'white' }}
            color="gray.200"
            fontWeight="medium"
            textAlign="left"
          >
            {item.label}
          </Box>
        ))}
        <Spacer />
        <IconButton
          aria-label="Toggle color mode"
          icon={colorMode === 'dark' ? <SunIcon /> : <MoonIcon />}
          onClick={toggleColorMode}
          alignSelf="center"
          mt={8}
        />
      </Stack>
      {/* Main Content */}
      <Box flex={1} p={[4, 8]}>
        {children}
      </Box>
    </Flex>
  );
} 