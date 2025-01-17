import { Box, Button, Image, Input, Text, Textarea } from "@chakra-ui/react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { Link } from "react-router-dom";
export default function Register() {
  return (
    <>
      <Navbar />
      <Box display="flex" justifyContent="space-between" flexDirection="row">
        <Box width="50%" height="fit-content">
          <Image src="/login.png" />
        </Box>
        <Box width="50%" py="5%">
          <Text fontSize="5xl" textAlign="center">
            Patient Registration
          </Text>
          <Box px="10%" py="5%">
            <Box
              display="flex"
              justifyContent="space-between"
              flexDirection="row"
            >
              <Input placeholder="First Name" mr="1%" />
              <Input placeholder="Last Name" />
            </Box>
            <Box
              display="flex"
              justifyContent="space-between"
              flexDirection="row"
              mt="2%"
            >
              <Input placeholder="Email" mr="1%" type="email"/>
              <Input placeholder="Phone Number" type="number"/>
            </Box>
            <Box
              display="flex"
              justifyContent="space-between"
              flexDirection="row"
              mt="2%"
            >
              <Input placeholder="Age" mr="1%" />
              <Input placeholder="Date Of Birth" type="date" />
            </Box>
            <Textarea placeholder="Address" mt="2%" />
            <Box
              display="flex"
              justifyContent="space-between"
              flexDirection="row"
              mt="2%"
            >
              
              <Input placeholder="Aadhar Card Number" mr="1%" type="number"/>
              <Button bgColor="yellow" color="black">
                Verify
              </Button>
            </Box>
            <Button width="100%" bgColor="#151E28" color="white" mt="10%">
              Register
            </Button>
            <Text mt="2%" fontSize="larger" textAlign="center">
              Already a User? Click Here to{" "}
              <Link to="/login">
                <Text display="inline" color="blue">
                  Login
                </Text>
              </Link>
            </Text>
          </Box>
        </Box>
      </Box>
      <Footer />
    </>
  );
}
