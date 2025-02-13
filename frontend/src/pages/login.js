import { Box, Button, Image, Input, Text, useToast } from "@chakra-ui/react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { FaCamera, FaFile } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function Login() {
  const [privateKey, setPrivateKey] = useState("");
  const [file, setFile] = useState(null);
  const [showScanner, setShowScanner] = useState(false); // State to toggle QR scanner
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

  // Handle QR code scan
  const handleScan = (data) => {
    if (data) {
      setPrivateKey(data); // Set the scanned data as the private key
      setShowScanner(false); // Hide the scanner after scanning
    }
  };

  // Handle QR code scan error
  const handleError = (err) => {
    console.error("QR Code Scan Error:", err);
    // toast({
    //   title: "Error",
    //   description: "Failed to scan QR code. Please try again.",
    //   status: "error",
    //   duration: 3000,
    //   isClosable: true,
    // });
  };

  // Initialize the QR code scanner
  useEffect(() => {
    if (showScanner) {
      const scanner = new Html5QrcodeScanner(
        "qr-reader", // ID of the container element
        { fps: 10, qrbox: 250 }, // Scanner configuration
        false // Verbose mode (set to true for debugging)
      );

      // Render the scanner
      scanner.render(handleScan, handleError);

      // Cleanup function to stop the scanner when the component unmounts or the scanner is closed
      return () => {
        scanner.clear().catch((error) => {
          console.error("Failed to clear QR scanner:", error);
        });
      };
    }
  }, [showScanner]);

  const handleLogin = async () => {
    if (!privateKey && !file) {
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
        navigate("/");
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
              <Button
                width="100%"
                bgColor="yellow"
                mt="5%"
                onClick={() => setShowScanner(true)} // Show the QR scanner
              >
                <Text mx="10px">Scan QR</Text> <FaCamera ml="2%" />
              </Button>
            </Box>

            {/* QR Code Scanner */}
            {showScanner && (
              <Box mt="5%">
                <div id="qr-reader" style={{ width: "100%" }}></div>
                <Button
                  width="100%"
                  bgColor="red.500"
                  color="white"
                  mt="2%"
                  onClick={() => setShowScanner(false)} // Hide the scanner
                >
                  Close Scanner
                </Button>
              </Box>
            )}

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