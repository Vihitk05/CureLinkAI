import { Box, Text, useToast } from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar({login=false}) {
  const navigate = useNavigate();
  const toast = useToast();
  const handleLogout = () => {
    console.log(localStorage.getItem("user_id"));
    localStorage.removeItem("user_id");
    toast({
      title: "Success",
      description: "Logout Successful",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    navigate("/");
  }
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
          <Link to="/">
            <Text color="white" cursor="pointer">
              Dashboard
            </Text>
          </Link>
          <Link to="/medicine">
            <Text color="white" cursor="pointer">
              Medicine Comparison
            </Text>
          </Link>
          <Link to="/disease">
            <Text color="white" cursor="pointer">
              Disease Prediction
            </Text>
          </Link>
          {login?
          <Link to="/login">
          <Text color="white" cursor="pointer">
            Login
          </Text>
        </Link>
          :
          <Link to="/" onClick={handleLogout}>
            <Text color="white" cursor="pointer" >
              Logout
            </Text>
          </Link>
          
          }
          
        </Box>
      </Box>
    </>
  );
}
