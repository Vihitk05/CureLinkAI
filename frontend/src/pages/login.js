import { Box, Button, Image, Input, Text } from "@chakra-ui/react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { FaCamera, FaFile } from "react-icons/fa";
import { Link } from "react-router-dom";
export default function Login() {
  return (
    <>
      <Navbar />
      <Box display="flex" justifyContent="space-between" flexDirection="row">
        <Box width="50%" height="fit-content">
          <Image src="/login.png" />
        </Box>
        <Box width="50%" py="5%">
          <Text fontSize="5xl" textAlign="center">
            Patient Login
          </Text>
          <Box px="10%" py="10%">
            <Input placeholder="Enter Private Key*" name="pr_key" id="pr_key" />
            <Text fontSize="xl" textAlign="center" color="gray.400" mt="5%">
              OR
            </Text>
            <Box
              display="flex"
              justifyContent="space-between"
              flexDirection="row"
            >
              <Button width="100%" bgColor="yellow" mt="5%" mr="5%">
                <Text mx="10px">Upload Private Key File </Text>{" "}
                <FaFile ml="2%" />
              </Button>
              <Button width="100%" bgColor="yellow" mt="5%">
                <Text mx="10px">Scan QR</Text> <FaCamera ml="2%" />
              </Button>
            </Box>
            <Button width="100%" bgColor="#151E28" color="white" mt="10%">
              Login
            </Button>
            <Text mt="2%" fontSize="larger" textAlign="center">
              New User? Click Here to{" "}
              <Link to="/register">
                  <Text display="inline" color="blue">Register</Text>
              </Link>
            </Text>
          </Box>
        </Box>
      </Box>
      <Footer />
    </>
  );
}
