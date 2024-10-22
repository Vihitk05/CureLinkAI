import {
  Box,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  Button,
} from "@chakra-ui/react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { Search2Icon } from "@chakra-ui/icons";
// import DiseasePredictionInfo from "../components/diseaseInfo";
import { useState } from "react";
import axios from "axios";
import TypewriterEffect from "../components/typewriterEffect";

export default function DiseasePrediction() {
  const [symptoms, setSymptoms] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [isThinking, setIsThinking] = useState(false);

  const handleInputChange = (e) => {
    setSymptoms(e.target.value);
  };

  const handleSearch = async () => {
    if (!symptoms) return; // Prevent empty submissions

    setIsThinking(true); // Start typewriter effect for "AI is thinking..."
    setPrediction(""); // Clear previous prediction

    try {
      // Replace 'YOUR_API_URL' with the actual endpoint
      const thinkingMessage = "Thinking..."; // Define the message
      setPrediction(thinkingMessage); // Set the thinking message for display

      const response = await axios.post("http://127.0.0.1:5000/predict", {
        symptoms: symptoms,
      });
      setIsThinking(false); // Stop thinking effect

      // Assuming the response has the content in the desired format
      setPrediction(response.data.Doctor.response); // Adjust this based on your API response structure
      setInterval(() => {
        console.log("Interval");
      }, 5000);
    } catch (error) {
      console.error("Error fetching prediction:", error);
      setPrediction("Error fetching prediction.");
    }
  };

  return (
    <>
      <Navbar />
      <Box
        minHeight="100vh"
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
      >
        <Box
          height="500px"
          overflowY="auto"
          display="flex"
          justifyContent="center"
        >
          <Text fontSize="lg" width="70%" pt="10" mb="10">
            {isThinking ? (
              <TypewriterEffect text={prediction} repeat={true} speed={100} />
            ) : (
              <TypewriterEffect text={prediction} speed={20} />
            )}
          </Text>
        </Box>
        <Box
          width="100%"
          display="flex"
          justifyContent="center"
          borderTop="1px solid gray"
          pt="4"
        >
          <InputGroup size="md" width="60%" mb="4">
            <Input
              placeholder="Please enter your symptoms..."
              focusBorderColor="#151E28"
              value={symptoms}
              onChange={handleInputChange}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()} // Allow Enter key submission
            />
            <InputRightElement>
              <Button onClick={handleSearch} variant="link">
                <Search2Icon />
              </Button>
            </InputRightElement>
          </InputGroup>
        </Box>

        <Footer />
      </Box>
    </>
  );
}
