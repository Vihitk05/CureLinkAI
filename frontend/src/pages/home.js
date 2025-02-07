import React, { useState } from "react";
import {
  Box,
  Button,
  Divider,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Input,
  useDisclosure,
  Spinner,
  useToast,
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
} from "@chakra-ui/react";
import { FaPlus } from "react-icons/fa";
import Footer from "../components/footer";
import Navbar from "../components/navbar";

const JWT = process.env.JWT;
console.log(process.env.JWT,"csvsdvsdvs");
  async function uploadBase64(base64String,file_name) {
    try {
      const binaryString = atob(base64String);
      const arrayBuffer = new ArrayBuffer(binaryString.length);
      const uint8Array = new Uint8Array(arrayBuffer);
  
      for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
      }
  
      const blob = new Blob([uint8Array], { type: "application/octet-stream" });
      const file = new File([blob], `${file_name}`);
  
      const data = new FormData();
      data.append("file", file);
  
      const upload = await fetch(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${JWT}`,
          },
          body: data,
        }
      );
  
      const uploadRes = await upload.json();
      console.log(uploadRes);
      return uploadRes;
    } catch (error) {
      console.error("Error uploading to Pinata:", error);
      throw error;
    }
  }

export default function Home() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [files, setFiles] = useState([]); // Track multiple files
  const [filePreview, setFilePreview] = useState(null); // Store the selected file content preview
  const [loading, setLoading] = useState(false);
  const [uploadedHashes, setUploadedHashes] = useState([]); // Store multiple IPFS hashes
  const toast = useToast();

  const handleFileChange = (event) => {
    const newFiles = Array.from(event.target.files); // Convert FileList to array
    setFiles((prevFiles) => [...prevFiles, ...newFiles]); // Add new files to existing list
  };

  const handleRemoveFile = (index) => {
    setFiles(files.filter((_, i) => i !== index)); // Remove the file from the list
  };

  const handleFileClick = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      setFilePreview(reader.result); // Display the file's content
    };
    reader.readAsDataURL(file); // Read the file content as base64
  };

  const handleOpenPDF = (file) => {
    const url = URL.createObjectURL(file); // Create a URL for the file (Blob URL)
    const newWindow = window.open(url, "_blank"); // Open the PDF in a new tab
    newWindow.focus(); // Focus the new window
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      alert("Please select at least one file to upload.");
      return;
    }

    setLoading(true);
    const hashes = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onload = async () => {
          const base64String = reader.result.split(",")[1];
          const response = await uploadBase64(base64String,file.name);
          console.log(response.IpfsHash)
          hashes.push(response.IpfsHash);

          // When all files have been uploaded, set the state for hashes
          if (hashes.length === files.length) {
            setUploadedHashes(hashes);
            toast({
              title: "Success",
              description: "All files uploaded successfully.",
              status: "success",
              duration: 3000,
              isClosable: true,
            });
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again later.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <>
      <Navbar />
      <Box
        height="600px"
        display="flex"
        flexDirection="row"
        px="1%"
        py="1%"
        justifyContent="space-between"
      >
        <Box
          width="20%"
          padding="1%"
          display="flex"
          justifyContent="space-between"
          flexDirection="column"
          boxShadow="lg"
          borderRadius="20px"
        >
          <Box>
            <Text fontSize="2xl" fontWeight="extrabold" textAlign="center">
              Vihit Khetle
            </Text>
            <Divider mb="5%" />
            <Text display="flex" justifyContent="space-between">
              <Text fontWeight="bold">Date of Birth: </Text>05-01-2004
            </Text>
            <Text display="flex" justifyContent="space-between">
              <Text fontWeight="bold">Age: </Text>21
            </Text>
            <Text display="flex" justifyContent="space-between">
              <Text fontWeight="bold">Gender: </Text>+91 9820778858
            </Text>
            <Text display="flex" justifyContent="space-between">
              <Text fontWeight="bold">Address: </Text>Dadar(W), Mumbai
            </Text>
          </Box>
          <Box>
            <Button colorScheme="yellow">View Records with Public Key</Button>
          </Box>
        </Box>
        <Box width="78%" padding="2%" boxShadow="lg" borderRadius="20px">
          <Box display="flex" justifyContent="flex-end">
            <Button colorScheme="yellow" gap="10px" onClick={onOpen}>
              Add New Document <FaPlus />
            </Button>
          </Box>
          <TableContainer mt="2%">
            <Table variant="striped" colorScheme="gray">
              <Thead>
                <Tr>
                  <Th>Disease</Th>
                  <Th>Hospital</Th>
                  <Th>Treatment</Th>
                  <Th>Date</Th>
                </Tr>
              </Thead>
              <Tbody>
                <Tr>
                  <Td>Vestibular Neuronitis</Td>
                  <Td>P.D. Hinduja Hospital</Td>
                  <Td>Operation</Td>
                  <Td>27-01-2025</Td>
                </Tr>
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
      <Footer />

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Upload New Documents</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input type="file" onChange={handleFileChange} multiple />
            <Box mt="4">
              {files.length > 0 && (
                <Box>
                  {files.map((file, index) => (
                    <Box
                      key={index}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mt="2"
                    >
                      <Box>
                        <Text
                          cursor="pointer"
                          onClick={() => handleFileClick(file)}
                        >
                          {file.name}
                        </Text>
                      </Box>
                      <Box display="flex" justifyContent="space-between" gap="10px">
                        <Button
                          size="sm"
                          colorScheme="red"
                          onClick={() => handleRemoveFile(index)}
                        >
                          Remove
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          onClick={() => handleOpenPDF(file)} // Open PDF in new tab
                        >
                          Open PDF
                        </Button>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
            {filePreview && (
              <Box mt="4">
                <Text>Preview:</Text>
                <Box mt="2">
                  <img
                    src={filePreview}
                    alt="Preview"
                    style={{ maxWidth: "100%", height: "auto" }}
                  />
                </Box>
              </Box>
            )}
            {loading && <Spinner mt="4" />}
            {uploadedHashes.length > 0 && (
              <Box mt="4">
                {uploadedHashes.map((hash, index) => (
                  <Text key={index}>
                    Uploaded File Hash {index + 1}: <b>{hash}</b>
                  </Text>
                ))}
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={handleUpload}
              isDisabled={loading}
            >
              Upload
            </Button>
            <Button onClick={onClose} isDisabled={loading}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
