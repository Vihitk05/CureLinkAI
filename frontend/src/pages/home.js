import React, { useEffect, useState } from "react";
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
  FormControl,
  FormLabel,
  Popover,
  PopoverTrigger,
  Portal,
  PopoverContent,
  PopoverArrow,
  PopoverHeader,
  PopoverCloseButton,
  PopoverBody,
  PopoverFooter,
  VStack,
  StackDivider,
  TableCaption,
  Progress,
} from "@chakra-ui/react";
import { FaPlus } from "react-icons/fa";
import Footer from "../components/footer";
import Navbar from "../components/navbar";
import { Link, useNavigate } from "react-router-dom";
import { IoEyeSharp } from "react-icons/io5";

const JWT = process.env.REACT_APP_JWT;

async function uploadBase64(base64String, file_name) {
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
  const [disease, setDisease] = useState("");
  const [hospital, setHospital] = useState("");
  const [treatment, setTreatment] = useState("");
  const [treatmentDate, setTreatmentDate] = useState("");
  const [userData, setUserData] = useState(null);
  const [medicalData, setMedicalData] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();
  const user_id = localStorage.getItem("user_id");
  useEffect(() => {
    if (!user_id) {
      toast({
        title: "Error",
        description: "Please Login First.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      navigate("/login");
    }
  }, [user_id]);

  const getUserDetails = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/fetch-user-details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user_id,
        }),
      });

      if (!response.ok) {
        toast({
          title: "Error",
          description: "Failed to fetch User Data.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }

      const data = await response.json();
      console.log("API Response:", data);
      setUserData(data.user);
    } catch (error) {
      console.error("Error calling API:", error);
      throw error;
    }
  };

  const getMedicalDetails = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/get-documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patient_id: user_id,
        }),
      });

      if (!response.ok) {
        toast({
          title: "Error",
          description: "Failed to fetch User Data.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }

      const data = await response.json();
      console.log("API Response:", data);
      setMedicalData(data.documents);
    } catch (error) {
      console.error("Error calling API:", error);
      throw error;
    }
  };

  useEffect(() => {
    getUserDetails();
    getMedicalDetails();
  }, []);

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

    if (!disease || !hospital || !treatment || !treatmentDate) {
      alert("Please fill in all fields.");
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
          const response = await uploadBase64(base64String, file.name);
          hashes.push(response.IpfsHash);

          // When all files have been uploaded, call the API
          if (hashes.length === files.length) {
            setUploadedHashes(hashes);
            await callAddPatientDocumentAPI(hashes);
            toast({
              title: "Success",
              description:
                "All files uploaded and document added successfully.",
              status: "success",
              duration: 3000,
              isClosable: true,
            });
            getMedicalDetails();
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

  const callAddPatientDocumentAPI = async (hashes) => {
    try {
      const response = await fetch(
        "http://127.0.0.1:5000/add-patient-document",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: userData.email, // Replace with the actual email
            report_hashes: hashes,
            disease: disease,
            hospital: hospital,
            treatment: treatment,
            treatment_date: treatmentDate,
          }),
        }
      );

      if (!response.ok) {
        toast({
          title: "Error",
          description: "Failed to Add Patient Data.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        throw new Error("Failed to add patient document");
      }

      const data = await response.json();
      console.log("API Response:", data);
    } catch (error) {
      console.error("Error calling API:", error);
      throw error;
    }
  };

  return (
    <>
      <Navbar login={false} />
      {userData && medicalData ? (
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
                {userData.first_name} {userData.last_name}
              </Text>
              <Divider mb="5%" />
              <Text display="flex" justifyContent="space-between">
                <Text fontWeight="bold">Date of Birth: </Text>
                {userData.dob}
              </Text>
              <Text display="flex" justifyContent="space-between">
                <Text fontWeight="bold">Age: </Text>
                {userData.age}
              </Text>
              <Text display="flex" justifyContent="space-between">
                <Text fontWeight="bold">Phone: </Text>+91 {userData.phone}
              </Text>
              <Text display="flex" justifyContent="space-between">
                <Text fontWeight="bold">Address: </Text>
                {userData.address}
              </Text>
              <Text display="flex" justifyContent="space-between">
                <Text fontWeight="bold">Email: </Text>
                {userData.email}
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
                    <Th></Th>
                    <Th>Disease</Th>
                    <Th>Hospital</Th>
                    <Th>Treatment</Th>
                    <Th>Treatment Date</Th>
                    <Th>Added By You</Th>
                    <Th>View Reports</Th>
                  </Tr>
                </Thead>
                {Array.isArray(medicalData) && medicalData.length > 0 ? (
                  <Tbody>
                    {medicalData.map((record, index) => (
                      <Tr key={index}>
                        <Td>{index + 1}.</Td>
                        <Td>{record.disease}</Td>
                        <Td>{record.hospital}</Td>
                        <Td>{record.treatment}</Td>
                        <Td>{record.treatment_date}</Td>
                        <Td>{record.added_by_patient ? "Yes" : "No"}</Td>
                        <Td>
                          <Popover>
                            <PopoverTrigger>
                              <Button
                                _hover={{ background: "none" }}
                                display="flex"
                                gap="5px"
                                background="none"
                              >
                                <IoEyeSharp fontSize="20px" />
                              </Button>
                            </PopoverTrigger>
                            <Portal>
                              <PopoverContent>
                                <PopoverArrow />
                                <PopoverHeader>Medical Reports</PopoverHeader>
                                <PopoverCloseButton />
                                <PopoverBody>
                                  <VStack
                                    divider={
                                      <StackDivider borderColor="gray.200" />
                                    }
                                    spacing={2}
                                  >
                                    {record.file_details
                                      .flat()
                                      .map((report_file, fileIndex) => (
                                        <Box
                                          key={fileIndex}
                                          display="flex"
                                          gap="10px"
                                        >
                                          <Text>{fileIndex + 1}.</Text>
                                          <Link
                                            to={report_file.file_url}
                                            target="_blank"
                                          >
                                            <Text
                                              color="blue"
                                              textDecoration="underline"
                                            >
                                              {report_file.file_name}
                                            </Text>
                                          </Link>
                                        </Box>
                                      ))}
                                  </VStack>
                                </PopoverBody>
                              </PopoverContent>
                            </Portal>
                          </Popover>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                ) : (
                  <TableCaption>No Medical Records</TableCaption>
                )}
              </Table>
            </TableContainer>
          </Box>
        </Box>
      ) : (
        <Box margin="20%">
          <Progress size='xs' isIndeterminate />
        </Box>
      )}

      <Footer />

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Upload New Documents</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb="4">
              <FormLabel>Disease</FormLabel>
              <Input
                value={disease}
                onChange={(e) => setDisease(e.target.value)}
                placeholder="Enter disease"
              />
            </FormControl>
            <FormControl mb="4">
              <FormLabel>Hospital</FormLabel>
              <Input
                value={hospital}
                onChange={(e) => setHospital(e.target.value)}
                placeholder="Enter hospital name"
              />
            </FormControl>
            <FormControl mb="4">
              <FormLabel>Treatment</FormLabel>
              <Input
                value={treatment}
                onChange={(e) => setTreatment(e.target.value)}
                placeholder="Enter treatment details"
              />
            </FormControl>
            <FormControl mb="4">
              <FormLabel>Treatment Date</FormLabel>
              <Input
                type="date"
                value={treatmentDate}
                onChange={(e) => setTreatmentDate(e.target.value)}
              />
            </FormControl>
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
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        gap="10px"
                      >
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
                          onClick={() => handleOpenPDF(file)}
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
