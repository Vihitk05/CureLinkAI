import {
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Heading,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  Skeleton,
  Text,
} from "@chakra-ui/react";
import Footer from "../components/footer";
import Navbar from "../components/navbar";
import { FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

export default function MedicineCompare() {
  const [medicineName, setMedicineName] = useState("");
  const [medicineData, setMedicineData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!medicineName) return;
    setLoading(true);
    setMedicineData(null);
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/fetch-medicines",
        {
          search: medicineName,
        }
      );
      setMedicineData(response.data);
    } catch (error) {
      console.error("Error fetching medicine data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <Box mb="10%">
        <Box mt="5%">
          <Text
            fontSize="5xl"
            fontWeight="extrabold"
            textAlign="center"
            px="5%"
          >
            Discover and Compare Medicine Prices in an Instant – Your Health,
            Your Savings!
          </Text>
          <Box display="flex" justifyContent="center" mx="20%" mt="1%">
            <InputGroup>
              <Input
                placeholder="Enter your medicine name"
                focusBorderColor="black"
                value={medicineName}
                onChange={(e) => setMedicineName(e.target.value)}
                borderRadius="20px"
              />
              <InputRightElement
                cursor="pointer"
                _hover={{
                  bg: "black",
                  color: "white",
                  borderRightRadius: "20px",
                }}
                onClick={handleSearch}
              >
                <FaSearch />
              </InputRightElement>
            </InputGroup>
          </Box>

          {/* Display Loading State */}
          {loading && (
            <Box
              display="flex"
              justifyContent="space-between"
              mx="5%"
              gap="20px"
              mt="5%"
              mb="10%"
            >
              <Box p="10px" borderRadius="20px" height="200px" width="400px">
                <Skeleton height="100px" />
                <Skeleton height="20px" mb="2%" />
                <Skeleton height="20px" mb="2%" />
                <Skeleton height="20px" mb="2%" />
                <Skeleton height="20px" mb="2%" />
              </Box>
              <Box p="10px" borderRadius="20px" height="200px" width="400px">
                <Skeleton height="100px" />
                <Skeleton height="20px" mb="2%" />
                <Skeleton height="20px" mb="2%" />
                <Skeleton height="20px" mb="2%" />
                <Skeleton height="20px" mb="2%" />
              </Box>
              <Box p="10px" borderRadius="20px" height="200px" width="400px">
                <Skeleton height="100px" />
                <Skeleton height="20px" mb="2%" />
                <Skeleton height="20px" mb="2%" />
                <Skeleton height="20px" mb="2%" />
                <Skeleton height="20px" mb="2%" />
              </Box>
            </Box>
          )}

          {/* Display Medicine Data */}
          {medicineData && medicineData.success && (
            <Box
              display="flex"
              justifyContent="space-between"
              mx="5%"
              gap="20px"
              mt="5%"
              mb="10%"
            >
              {/* 1mg Card */}
              {medicineData.one_mg && (
                <Card width="400px">
                  <CardHeader>
                    <Heading size="md" display="flex" justifyContent="center">
                      <Image
                        src="https://www.1mg.com/images/tata_1mg_logo.svg"
                        width="200px"
                        height="100px"
                      />
                    </Heading>
                  </CardHeader>
                  <CardBody>
                    <Text fontSize="2xl" fontWeight="extrabold">
                      {medicineData.one_mg.title}
                    </Text>
                    <Text
                      fontSize="xl"
                      fontWeight="medium"
                      color="gray"
                      fontStyle="italic"
                    >
                      {medicineData.one_mg.pack_size}
                    </Text>
                    <Text fontSize="2xl" fontWeight="extrabold" mt="5%">
                      {medicineData.one_mg.price}
                    </Text>
                  </CardBody>
                  <Link to={medicineData.one_mg.url} target="_blank">
                    <CardFooter display="flex" justifyContent="center">
                      <Button
                        colorScheme="yellow"
                        fontWeight="bold"
                        color="black"
                        width="100%"
                      >
                        Buy Now
                      </Button>
                    </CardFooter>
                  </Link>
                </Card>
              )}

              {/* Apollo Pharmacy Card */}
              {medicineData.apollopharmacy && (
                <Card width="400px">
                  <CardHeader>
                    <Heading size="md" display="flex" justifyContent="center">
                      <Image
                        src="https://images.apollo247.in/images/pharmacy_logo.svg?tr=q-80,w-100,dpr-1,c-at_max"
                        width="200px"
                        height="100px"
                      />
                    </Heading>
                  </CardHeader>
                  <CardBody>
                    <Text fontSize="2xl" fontWeight="extrabold">
                      {medicineData.apollopharmacy.title}
                    </Text>
                    <Text
                      fontSize="xl"
                      fontWeight="medium"
                      color="gray"
                      fontStyle="italic"
                    >
                      {medicineData.apollopharmacy.unit_size}
                    </Text>
                    <Text fontSize="2xl" fontWeight="extrabold" mt="5%">
                      ₹{medicineData.apollopharmacy.discount_price}
                    </Text>
                  </CardBody>
                  <Link to={medicineData.apollopharmacy.url} target="_blank">
                    <CardFooter display="flex" justifyContent="center">
                      <Button
                        colorScheme="yellow"
                        fontWeight="bold"
                        color="black"
                        width="100%"
                      >
                        Buy Now
                      </Button>
                    </CardFooter>
                  </Link>
                </Card>
              )}

              {/* PharmEasy Card */}
              {medicineData.pharmeasy && (
                <Card width="400px">
                  <CardHeader>
                    <Heading size="md" display="flex" justifyContent="center">
                      <Image
                        src="https://assets.pharmeasy.in/apothecary/images/logo_big.svg?dim=256x0"
                        width="200px"
                        height="100px"
                      />
                    </Heading>
                  </CardHeader>
                  <CardBody>
                    <Text fontSize="2xl" fontWeight="extrabold">
                      {medicineData.pharmeasy.titile}
                    </Text>
                    <Text
                      fontSize="xl"
                      fontWeight="medium"
                      color="gray"
                      fontStyle="italic"
                    >
                      {medicineData.pharmeasy.pack_size}
                    </Text>
                    <Text fontSize="2xl" fontWeight="extrabold" mt="5%">
                      ₹{medicineData.pharmeasy.price}
                    </Text>
                  </CardBody>
                  <Link to={medicineData.pharmeasy.url} target="_blank">
                    <CardFooter display="flex" justifyContent="center">
                      <Button
                        colorScheme="yellow"
                        fontWeight="bold"
                        color="black"
                        width="100%"
                      >
                        Buy Now
                      </Button>
                    </CardFooter>
                  </Link>
                </Card>
              )}
            </Box>
          )}
          {medicineData && medicineData.success === false && (
            <>
              <Text
                textAlign="center"
                fontSize="3xl"
                fontWeight="extrabold"
                mt="5%"
              >
                Please enter the correct medicine
              </Text>
            </>
          )}
        </Box>
      </Box>
      <Footer />
    </>
  );
}
