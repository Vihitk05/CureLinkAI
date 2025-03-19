import { Box, Button, Image, Text } from "@chakra-ui/react";
import Footer from "../components/footer";
import Navbar from "../components/navbar";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <>
      <Navbar login={true} />
      <Box>
        <Box
          display="flex"
          justifyContent="space-between"
          bg="#151E28"
          borderBottomRadius="350px"
          mb="2%"
        >
          <Box
            width="60%"
            pl="5%"
            display="flex"
            justifyContent="center"
            flexDirection="column"
          >
            <Text color="white" fontWeight="bold" fontSize="5xl">
              Secure. Smart. Decentralized.
            </Text>
            <Text color="white" fontSize="xl">
              Access Secure Medical Records, Predict Diseases with AI, and
              Compare Medicine Prices Instantly.
            </Text>
          </Box>
          <Box
            width="40%"
            display="flex"
            px="3%"
            py="10%"
            justifyContent="center"
            alignItems="center"
          >
            <Image src="/image.png" width="300px" height="300px" alt="" />
          </Box>
        </Box>
        <Box px="5%" my="10%" display="flex" justifyContent="space-between">
          <Box width="50%">
            <Image src="/image2.png" alt="" />
          </Box>
          <Box width="50%">
            <Text fontSize="4xl" fontWeight="extrabold" mb="5%">
              Why Choose Us?
            </Text>
            <Text fontSize="xl" fontWeight="medium">
              • Decentralized & Secure – Your medical records are encrypted and
              stored on a blockchain for maximum privacy.
            </Text>
            <Text fontSize="xl" fontWeight="medium">
              • AI-Powered Diagnosis – Get instant disease predictions based on
              symptoms using advanced AI models.
            </Text>
            <Text fontSize="xl" fontWeight="medium">
              • Effortless Access – Retrieve any medical record using a public
              key, anytime, anywhere.
            </Text>
            <Text fontSize="xl" fontWeight="medium">
              • Smart Price Comparison – Find the best medicine prices from
              multiple online pharmacies in real time.
            </Text>
            <Text fontSize="xl" fontWeight="medium">
              • Patient-Centric Control – You decide who accesses your health
              data—no intermediaries, no risk.
            </Text>
          </Box>
        </Box>
        <Box display="flex" justifyContent="space-around" flexDirection="column" my="5%">
          <Text fontSize="5xl" fontWeight="extrabold" textAlign="center" my="5%">
            What do you want to do?
          </Text>
          <Box display="flex" justifyContent="space-around">
            <Box
              display="flex"
              justifyContent="space-between"
              flexDirection="column"
              boxShadow="5px 6px 3px gray"
              borderRadius="20px"
              padding="20px"
            >
              <Image src="/image3.png" width="300px" height="350px" alt="" />
              <Link to="/login">
                <Button colorScheme="yellow" width="100%" cursor="pointer">
                  Patient Login
                </Button>
              </Link>
            </Box>
            <Box
              display="flex"
              justifyContent="space-between"
              flexDirection="column"
              boxShadow="5px 6px 3px gray"
              borderRadius="20px"
              padding="20px"
            >
              <Image src="/image4.png" width="300px" height="350px" alt="" />
              <Link to="/">
                <Button colorScheme="yellow" width="100%" cursor="pointer">
                  Hospital Login
                </Button>
              </Link>
            </Box>
            <Box
              display="flex"
              justifyContent="space-between"
              flexDirection="column"
              boxShadow="5px 6px 3px gray"
              borderRadius="20px"
              padding="20px"
            >
              <Image src="/image5.png" width="300px" height="300px" alt="" />
              <Link to="/">
                <Button colorScheme="yellow" width="100%">
                  View Any Records
                </Button>
              </Link>
            </Box>
          </Box>
        </Box>
      </Box>
      <Footer />
    </>
  );
}
