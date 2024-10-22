import { Box, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <>
      <Box
        height={16}
        bgColor="#151E28"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box>
          <Link to="/">
            <Text
              fontSize="2xl"
              color="white"
              paddingLeft="10"
              fontWeight="bold"
              cursor="pointer"
            >
              CureLink AI
            </Text>
          </Link>
        </Box>
        <Box
          display="flex"
          justifyContent="space-around"
          flexDirection="row"
          gap="20px"
          paddingRight="10"
        >
          <Link to="/disease">
            <Text color="white" cursor="pointer">
              Disease Prediction
            </Text>
          </Link>
          <Text color="white" cursor="pointer">
            Logout
          </Text>
        </Box>
      </Box>
    </>
  );
}
