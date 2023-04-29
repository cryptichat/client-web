import React, { createContext, useState, useEffect } from "react";
import Web3 from "web3";

const ContractContext = createContext();

const ContractProvider = ({ children }) => {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);

  useEffect(() => {
    async function init() {
      //const response = await fetch("/contract.json");
      //const data = await response.json();
      const abi = await (await fetch('/abi.json')).json();
      const providerURL = "https://eth-sepolia.g.alchemy.com/v2/fhotvZ8l6jNOTuEkxd8W6pVO_PKf6ns6";
      const contractAddress = 0xEe60E00665a03F58fed80082C241F3c820867372;
      console.log("providerURL", providerURL);
      const web3 = new Web3(providerURL);
      setWeb3(web3);
      const contractABI = abi.abi; //|| data.abi;
      console.log("contractAddress", contractAddress);
      const contract = new web3.eth.Contract(contractABI, contractAddress);
      setContract(contract);
    }
    init();
  }, []);

  return (
    <ContractContext.Provider value={{ web3, contract }}>
      {children}
    </ContractContext.Provider>
  );
};

export { ContractContext, ContractProvider };
