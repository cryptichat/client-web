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
      const providerURL = import.meta.env.VITE_WEB3_PROVIDER_URL || "http://localhost:8545";
      const web3 = new Web3(providerURL);
      setWeb3(web3);
      const contractABI = abi.abi; //|| data.abi;
      const contractAddress = import.meta.env.VITE_DEPLOYED_CONTRACT_ADDRESS; //|| data.networks["5777"].address;
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
