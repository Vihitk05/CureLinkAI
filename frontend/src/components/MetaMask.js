import React, { useState } from "react";
import {
  VStack,
  HStack,
  Button,
  Text,
  Box,
  Heading,
  useToast,
  Divider,
} from "@chakra-ui/react";
import { FaWallet, FaEthereum } from "react-icons/fa";

const MetaMask = ({ onWalletConnect }) => {
  // const [errorMessage, setErrorMessage] = useState(null);
  const [defaultAccount, setDefaultAccount] = useState(null);
  const [userBalance, setUserBalance] = useState(null);
  const toast = useToast();

  const connectWallet = () => {
    if (window.ethereum) {
      window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then((result) => {
          accountChanged(result[0]);
          toast({
            title: "Wallet Connected",
            description: "Successfully connected to MetaMask",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        })
        .catch((error) => {
          toast({
            title: "Connection Error",
            description: error.message,
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        });
    } else {
      toast({
        title: "MetaMask Not Found",
        description: "Please install MetaMask",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const accountChanged = (accountName) => {
    setDefaultAccount(accountName);
    onWalletConnect(accountName); // Pass the wallet address to the parent
    getUserBalance(accountName);
  };

  const getUserBalance = (accountAddress) => {
    window.ethereum
      .request({
        method: "eth_getBalance",
        params: [String(accountAddress), "latest"],
      })
      .then((balance) => {
        const balanceInEther = (parseInt(balance, 16) / 1e18).toFixed(4);
        setUserBalance(balanceInEther);
      })
      .catch((error) => {
        toast({
          title: "Balance Fetch Error",
          description: "Could not retrieve account balance",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  return (
    <VStack spacing={6} align="stretch" p={5}>
      <Heading
        size="md"
        textAlign="center"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <FaEthereum /> Ethereum Wallet
      </Heading>

      <Button
        leftIcon={<FaWallet />}
        colorScheme={defaultAccount ? "green" : "blue"}
        onClick={connectWallet}
      >
        {defaultAccount ? "Wallet Connected" : "Connect Wallet"}
      </Button>

      {defaultAccount && (
        <Box>
          <VStack spacing={4} align="stretch">
            <HStack>
              <Text fontWeight="bold">Address:</Text>
              <Text isTruncated>{defaultAccount}</Text>
            </HStack>
            <HStack>
              <Text fontWeight="bold">Balance:</Text>
              <Text>{userBalance} ETH</Text>
            </HStack>
            <Divider />
          </VStack>
        </Box>
      )}
    </VStack>
  );
};

export default MetaMask;
