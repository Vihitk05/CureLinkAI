import {
  Box,
  Button,
  Image,
  Input,
  Text,
  Textarea,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import MetaMask from "../components/MetaMask";
import QRCode from "qrcode"; // Import QRCode library
import html2canvas from "html2canvas"; // Import html2canvas library

export default function Register() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [walletAddress, setWalletAddress] = useState(null);
  const [privateKey, setPrivateKey] = useState(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState(null); // State to store QR code data URL
  const qrCodeRef = useRef(null); // Ref for the QR code element

  // Input fields state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    age: "",
    dob: "",
    address: "",
    aadhar: "",
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleWalletConnect = (address) => {
    setWalletAddress(address);
    onClose(); // Close the modal after connecting the wallet
  };

  const handleRegister = async () => {
    // Include walletAddress in the data
    const dataToSend = { ...formData, walletAddress };

    try {
      const response = await fetch("http://127.0.0.1:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        // Correctly extract the private_key from the response
        const responseData = await response.json();
        setPrivateKey(responseData.private_key); // Use responseData.private_key instead of privateKey

        // Debug: Print the private key
        console.log("Private Key:", responseData.private_key);

        // Generate QR code for the private key
        QRCode.toDataURL(responseData.private_key, (err, url) => {
          if (err) {
            console.error("Failed to generate QR code:", err);
            toast({
              title: "Error",
              description: "Failed to generate QR code.",
              status: "error",
              duration: 3000,
              isClosable: true,
            });
          } else {
            console.log("QR Code Data URL:", url); // Debug: Print the QR code data URL
            setQrCodeDataUrl(url); // Set the QR code data URL
          }
        });

        toast({
          title: "Registration Successful",
          description: "Your private key has been generated.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Registration failed");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(privateKey);
    toast({
      title: "Copied to Clipboard",
      description: "Private key copied successfully.",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([privateKey], { type: "application/x-pem-file" }); // Set MIME type for PEM file
    element.href = URL.createObjectURL(file);
    element.download = "private_key.pem"; // Set download file extension as .pem
    document.body.appendChild(element); // Required for Firefox
    element.click();
  };

  const handleDownloadQRCode = () => {
    if (qrCodeRef.current) {
      html2canvas(qrCodeRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "private_key_qr.png"; // Set download file name
        link.click();
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
          {privateKey === null ? (
            <Text fontSize="5xl" textAlign="center">
              Patient Registration
            </Text>
          ) : (
            <Text fontSize="5xl" textAlign="center">
              Registration Successful
            </Text>
          )}
          <Box px="10%" py="5%">
            {privateKey === null ? (
              <Box>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  flexDirection="row"
                >
                  <Input
                    name="firstName"
                    placeholder="First Name"
                    mr="1%"
                    value={formData.firstName}
                    onChange={handleInputChange}
                  />
                  <Input
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                  />
                </Box>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  flexDirection="row"
                  mt="2%"
                >
                  <Input
                    name="email"
                    placeholder="Email"
                    mr="1%"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                  <Input
                    name="phone"
                    placeholder="Phone Number"
                    type="number"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </Box>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  flexDirection="row"
                  mt="2%"
                >
                  <Input
                    name="age"
                    placeholder="Age"
                    mr="1%"
                    value={formData.age}
                    onChange={handleInputChange}
                  />
                  <Input
                    name="dob"
                    placeholder="Date Of Birth"
                    type="date"
                    value={formData.dob}
                    onChange={handleInputChange}
                  />
                </Box>
                <Textarea
                  name="address"
                  placeholder="Address"
                  mt="2%"
                  value={formData.address}
                  onChange={handleInputChange}
                />
                <Box
                  display="flex"
                  justifyContent="space-between"
                  flexDirection="row"
                  mt="2%"
                >
                  <Input
                    name="aadhar"
                    placeholder="Aadhar Card Number"
                    mr="1%"
                    type="number"
                    value={formData.aadhar}
                    onChange={handleInputChange}
                  />
                </Box>

                {/* Wallet Connect Button */}
                <Button
                  width="100%"
                  bgColor="#151E28"
                  color="white"
                  mt="5%"
                  onClick={onOpen}
                >
                  {walletAddress
                    ? `Connected: ${walletAddress}`
                    : "Connect to Wallet"}
                </Button>

                <Button
                  width="100%"
                  bgColor="#151E28"
                  color="white"
                  mt="5%"
                  onClick={handleRegister}
                >
                  Register
                </Button>
              </Box>
            ) : (
              <Box mt="5%">
                <Text fontWeight="extrabold" fontSize="2xl" textAlign="center" mb="2%">
                  Private Key will be displayed only once:
                </Text>
                <Box display="flex" justifyContent="center" flexDirection="column" gap="10px">
                  <Button mr="2%" colorScheme="yellow" onClick={handleCopy} width="100%">
                    Copy Private Key
                  </Button>
                  <Text fontSize="xl" textAlign="center">OR</Text>
                  <Button colorScheme="yellow" onClick={handleDownload}>
                    Download Private Key
                  </Button>
                  <Text fontSize="xl" textAlign="center">OR</Text>
                  {/* QR Code Section */}
                  {qrCodeDataUrl && (
                    <Box textAlign="center">
                      <img
                        ref={qrCodeRef}
                        src={qrCodeDataUrl}
                        alt="Private Key QR Code"
                        style={{ width: "200px", height: "200px", margin: "0 auto" }}
                      />
                      <Button colorScheme="yellow" mt="2%" onClick={handleDownloadQRCode}>
                        Download QR Code
                      </Button>
                    </Box>
                  )}
                </Box>
              </Box>
            )}

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

      {/* Modal for MetaMask */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Connect to Wallet</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <MetaMask onWalletConnect={handleWalletConnect} />
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose} colorScheme="blue">
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}