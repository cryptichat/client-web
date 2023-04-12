import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, gql } from "@apollo/client";

// import { subtle } from "crypto"
import { IoPersonAddSharp } from "react-icons/io5";
import { motion } from "framer-motion";

import { ContractContext } from "../utils/ContractProvider";

import "./styles.css";

const SIGNUP = gql`
  mutation CreateAccount(
    $username: String!
    $email: String!
    $password1: String!
    $password2: String!
    $publicKey: String!
  ) {
    createAccount(
      username: $username
      email: $email
      password1: $password1
      password2: $password2
      publickey: $publicKey
    ) {
      accessToken
    }
  }
`;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
  exit: { opacity: 0, transition: { ease: "easeInOut" } },
};

const titleVariants = {
  hidden: { y: -50, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, type: "spring", stiffness: 60 },
  },
};

const formVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, type: "spring", stiffness: 60 },
  },
};

function Register() {
  const navigate = useNavigate();
  const { web3, contract } = useContext(ContractContext);

  
  // React States
  const [errors, setErrors] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formState, setFormState] = useState({
    uname: "",
    email: "",
    pass1: "",
    pass2: "",
  });

  const [signupHandler] = useMutation(SIGNUP, {
    onCompleted: ({ createAccount }) => {
      if (createAccount.accessToken) {
        setIsSubmitted(true);
        localStorage.setItem("auth-token", createAccount.accessToken);
        localStorage.setItem("dsmessenger-username", formState.uname); // TODO: replace localStorage call with global state management
        navigate("/");
      }
    },
    onError: ({ graphQLErrors }) => {
      setErrors(graphQLErrors);
    },
  });

  function arrayBufferToBase64(buffer) {
    const binary = String.fromCharCode(...new Uint8Array(buffer));
    return btoa(binary);
  }

  async function handleRegister() {
    try {
      // Generate key pair
      const keyPair = await crypto.subtle.generateKey(
        {
          name: "RSA-OAEP",
          modulusLength: 2048,
          publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
          hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]
      );

      // Export public key
      const publicKeyDer = await crypto.subtle.exportKey(
        "spki",
        keyPair.publicKey
      );
      const publicKeyPem = arrayBufferToBase64(publicKeyDer);

      // Export private key
      const privateKeyJwk = await crypto.subtle.exportKey(
        "jwk",
        keyPair.privateKey
      );

      // Sign up
      await signupHandler({
        variables: {
          username: formState.uname,
          email: formState.email,
          password1: formState.pass1,
          password2: formState.pass2,
          publicKey: publicKeyPem,
        },
      });

      console.log("Account created successfully");

      // get private key from contract
      const contractPrivateKey = await contract.methods.getKey(formState.uname).call();
      if (contractPrivateKey !== publicKeyPem) {
        alert("Blockchain integrity check failed. Please try again later.");
      }

      console.log("key from blockchain: ", contractPrivateKey);

      // Generate AES-GCM key
      const aesGcmKey = await crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true,
        ["wrapKey", "unwrapKey"]
      );

      // Export the private key as a wrapped key
      const wrappedPrivateKey = await crypto.subtle.wrapKey(
        "pkcs8",
        keyPair.privateKey, // Pass the actual CryptoKey object here
        aesGcmKey,
        { name: "AES-GCM", iv: crypto.getRandomValues(new Uint8Array(12)) }
      );

      // Store the wrapped private key in local storage
      localStorage.setItem(
        "privateKey",
        arrayBufferToBase64(wrappedPrivateKey)
      );
      console.log("Private key stored securely in local storage");
    } catch (error) {
      console.error(error);
    }
  }

  // JSX code for login form
  const renderForm = (
    <div className="form px-2 mx-3 rounded-[10px]">
      <div className="input-container">
        <label
          for="text"
          class="block text-sm font-medium text-gray-900 dark:text-white"
        >
          Username{" "}
        </label>
        <input
          type="text"
          class="mb-4 bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-white-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500"
          name="uname"
          value={formState.uname}
          onChange={(e) =>
            setFormState({
              ...formState,
              uname: e.target.value,
            })
          }
          required
        />
      </div>
      <div className="input-container">
        <label
          for="email"
          class="block text-sm font-medium text-gray-900 dark:text-white"
        >
          Email{" "}
        </label>
        <input
          type="email"
          class="mb-4 bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-white-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500"
          name="email"
          value={formState.email}
          onChange={(e) =>
            setFormState({
              ...formState,
              email: e.target.value,
            })
          }
          required
        />
      </div>
      <div className="input-container">
        <label
          for="password"
          class="block text-sm font-medium text-gray-900 dark:text-white"
        >
          Password{" "}
        </label>
        <input
          type="password"
          class="mb-4 bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-white-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500"
          name="pass1"
          value={formState.pass1}
          onChange={(e) =>
            setFormState({
              ...formState,
              pass1: e.target.value,
            })
          }
          required
        />
      </div>
      <div className="input-container">
        <label
          for="password"
          class="block text-sm font-medium text-gray-900 dark:text-white"
        >
          Confirm Password{" "}
        </label>
        <input
          type="password"
          class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-white-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500"
          name="pass2"
          value={formState.pass2}
          onChange={(e) =>
            setFormState({
              ...formState,
              pass2: e.target.value,
            })
          }
          required
        />
      </div>
      <div
        className="propic px-2 py-2"
        style={{ display: "flex", justifyContent: "center" }}
      >
        <div
          className="addpicture mt-2 p-2 hidden bg-zinc-900 md:flex border border-[#ffffff]
                                  text-[#ffffff] rounded-[10px] items-center 
                                    hover:bg-[#000000] hover:text-white transition duration-200"
        >
          <input style={{ display: "none" }} type="file" id="file" />
          <label htmlFor="file">
            <IoPersonAddSharp className="text-[20px] text-white" />
            <span className="text-[15px] text-white px-2">
              Add a profile picture
            </span>
          </label>
        </div>
      </div>
      <div className="button-container p-2">
        <input
          type="submit"
          class="w-full text-white bg-purple-900 hover:bg-[#4c1d95] focus:ring-4 focus:outline-none focus:ring-[#4c1d95] font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-[#4c1d95] dark:hover:bg-[#4c1d95] dark:focus:ring-purple-900"
          onClick={async () => await handleRegister()}
        />
      </div>
      <div>
        {errors.map((error) => (
          <div className="error">{error.message}</div>
        ))}
      </div>

      <p class="my-2 pl-2.5 text-sm font-light text-gray-500 dark:text-gray-400">
        Already have an account?{" "}
        <a
          href="#"
          class="font-medium text-primary-600 hover:underline dark:text-primary-500"
          onClick={() => navigate("/login")}
        >
          Login
        </a>
      </p>
    </div>
  );

  return (
    <motion.div
      className="app"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="login-form w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
        <div className="title text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
          <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white px-6 mt-2">
            Register
          </h1>
        </div>
        {isSubmitted ? (
          <motion.div>
            User is successfully registered
            <div className="button-container">
              <button
                onClick={() => navigate("/")}
                class="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
              >
                Continue
              </button>
            </div>
          </motion.div>
        ) : (
          renderForm
        )}
      </div>
    </motion.div>
  );
}

export default Register;
