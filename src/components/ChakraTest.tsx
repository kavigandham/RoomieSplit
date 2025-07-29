import { Box, useColorMode, Avatar, IconButton } from '@chakra-ui/react';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';

export default function ChakraTest() {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <Box>
      <Avatar name="Test User" />
      <IconButton
        aria-label="Toggle color mode"
        icon={colorMode === 'dark' ? <SunIcon /> : <MoonIcon />}
        onClick={toggleColorMode}
      />
    </Box>
  );
}