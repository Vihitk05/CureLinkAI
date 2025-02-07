import { Box, Button, Image, Input, Text, useToast } from "@chakra-ui/react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { FaCamera, FaFile } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  // eslint-disable-next-line
  const [file, setFile] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();
  // Handle private key file upload
  const handleFileChange = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPrivateKey(e.target.result); // Store the file content (PEM) in state
      };
      reader.readAsText(uploadedFile);
    }
  };

  const handleLogin = async () => {
    if (!email || (!privateKey && !file)) {
      toast({
        title: "Error",
        description: "Please fill in all fields or upload the private key file",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          private_key: privateKey || file, // Use either the typed private key or uploaded file content
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast({
          title: "Success",
          description: data.message,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        navigate('/');
      } else {
        toast({
          title: "Error",
          description: data.error,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again later.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

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
            <Input
              placeholder="Enter Email"
              name="email"
              id="email"
              mb="2%"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              placeholder="Enter Private Key*"
              name="pr_key"
              id="pr_key"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
            />
            <Text fontSize="xl" textAlign="center" color="gray.400" mt="5%">
              OR
            </Text>
            <Box
              display="flex"
              justifyContent="space-between"
              flexDirection="row"
            >
              <Button
                width="100%"
                bgColor="yellow"
                mt="5%"
                mr="5%"
                onClick={() => document.getElementById("fileInput").click()}
              >
                <Text mx="10px">Upload Private Key File </Text>{" "}
                <FaFile ml="2%" />
              </Button>
              <input
                id="fileInput"
                type="file"
                accept=".pem"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              <Button width="100%" bgColor="yellow" mt="5%">
                <Text mx="10px">Scan QR</Text> <FaCamera ml="2%" />
              </Button>
            </Box>

            <Button
              width="100%"
              bgColor="#151E28"
              mt="5%"
              color="white"
              onClick={handleLogin}
            >
              Login
            </Button>
            <Text mt="2%" fontSize="larger" textAlign="center">
              New User? Click Here to{" "}
              <Link to="/register">
                <Text display="inline" color="blue">
                  Register
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
