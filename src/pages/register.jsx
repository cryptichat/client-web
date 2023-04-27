import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, gql } from "@apollo/client";
import { IoPersonAddSharp } from "react-icons/io5";
import { motion } from "framer-motion";
import { ContractContext } from "../utils/ContractProvider";
import lock192 from "./lock192.png";
import "./styles.css";

export const SIGNUP = gql`
  mutation CreateAccount(
    $username: String!
    $email: String!
    $password: String!
    $publicKey: String!
  ) {
    createAccount(
      username: $username
      email: $email
      password: $password
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

const lock192Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.5, type: "spring", stiffness: 60 },
  },
};

function Register() {
  const navigate = useNavigate();
  const { web3, contract } = useContext(ContractContext);

  const [errors, setErrors] = useState([]);
  const [formState, setFormState] = useState({
    uname: "",
    email: "",
    pass1: "",
    pass2: "",
  });

  const [signupHandler] = useMutation(SIGNUP, {
    onCompleted: async ({ createAccount }) => {
      if (createAccount.accessToken) {
        // Define a function that returns a Promise to set localStorage items
        const setLocalStorageItems = () => {
          return new Promise((resolve) => {
            localStorage.setItem("auth-token", createAccount.accessToken);
            setTimeout(1000);
            resolve();
          });
        };

        // Call the function and wait for it to complete before navigating
        await setLocalStorageItems();
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
    if (formState.pass1 !== formState.pass2) {
      console.log("Passwords do not match");
      setErrors([...errors, { message: "Passwords do not match" }]);
    } else {
      try {
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
        const publicKeyDer = await crypto.subtle.exportKey(
          "spki",
          keyPair.publicKey
        );
        const publicKeyPem = arrayBufferToBase64(publicKeyDer);

        const privateKeyDer = await crypto.subtle.exportKey(
          "pkcs8",
          keyPair.privateKey
        );

        await signupHandler({
          variables: {
            username: formState.uname,
            email: formState.email,
            password: formState.pass1,
            publicKey: publicKeyPem,
          },
        });

        console.log("Account created successfully");

        localStorage.setItem("privateKey", arrayBufferToBase64(privateKeyDer));
        console.log("Private key stored securely in local storage");
      } catch (error) {
        console.error(error);
      }
    }
  }

  const renderForm = (
    <div className="form">
      <div className="input-container">
        <label
          htmlFor="username"
          className="block text-sm font-medium text-white"
        >
          Username{" "}
        </label>
        <input
          type="text"
          className="mb-4 bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-[5px] focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 bg-white-700 border-gray-600 placeholder-gray-400 text-black focus:ring-blue-500 focus:border-blue-500"
          name="uname"
          id="username"
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
          htmlFor="email"
          className="block text-sm font-medium text-gray-900 text-white"
        >
          Email{" "}
        </label>
        <input
          type="email"
          id="email"
          className="mb-4 bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-[5px] focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 bg-white-700 border-gray-600 placeholder-gray-400 text-black focus:ring-blue-500 focus:border-blue-500"
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
          htmlFor="password-input"
          className="block text-sm font-medium text-gray-900 text-white"
        >
          Password{" "}
        </label>
        <input
          type="password"
          className="mb-4 bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-[5px] focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 bg-white-700 border-gray-600 placeholder-gray-400 text-black focus:ring-blue-500 focus:border-blue-500"
          name="pass1"
          data-testid="password-input"
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
          htmlFor="password"
          className="block text-sm font-medium text-gray-900 text-white"
        >
          Confirm Password{" "}
        </label>
        <input
          type="password"
          className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-[5px] focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 bg-white-700 border-gray-600 placeholder-gray-400 text-black focus:ring-blue-500 focus:border-blue-500"
          name="pass2"
          id="password2"
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
      <div className="flex justify-center p-2 my-2">
        <input
          type="submit"
          className="w-full mt-2.5 text-white font-medium rounded text-sm text-center bg-[#8b5cf6] hover:bg-[#4c1d95] py-2 cursor-pointer"
          onClick={async () => await handleRegister()}
        />
      </div>
      <div>
        {errors.map((error) => (
          <div className="error">{error.message}</div>
        ))}
      </div>

      <p className="my-2 pl-2.5 text-sm font-light text-gray-500 text-gray-400">
        Already have an account?{" "}
        <a
          href="#"
          className="font-medium text-primary-600 hover:underline text-primary-500"
          onClick={() => navigate("/login")}
        >
          Login
        </a>
      </p>
    </div>
  );

  // return (
  //   <motion.div
  //     className="app flex items-center justify-center min-h-screen"
  //     variants={containerVariants}
  //     initial="hidden"
  //     animate="visible"
  //     exit="exit"
  //   >
  //     <div className="logo">
  //       <div
  //         className="flex items-center"
  //         style={{ display: "flex", alignItems: "center" }}
  //       >
  //         <div
  //           className="mx-2 my-5"
  //           style={{
  //             boxShadow: "0 8px 9px rgba(0, 0, 0, 0.5)",
  //             borderRadius: 25,
  //           }}
  //         >
  //           <motion.img
  //             src={lock192}
  //             width="60px"
  //             height="59.928px"
  //             alt="ChatApp logo"
  //             variants={lock192Variants}
  //           />

  //         </div>
  //         <h1 className="text-xl font-bold leading-tight tracking-tight md:text-2xl text-white p-2">
  //           CrypticChat
  //         </h1>
  //       </div>
  //       <div className="w-full max-w-md">
  //         <div className="rounded-[8px] shadow border bg-gray-800 border-gray-700 ">
  //           <div className="title text-xl font-bold text-white">
  //             <h1 className="text-xl font-bold text-white md:text-2xl">
  //               Register
  //             </h1>
  //           </div>
  //           {isSubmitted ? (
  //             <motion.div>
  //               User is successfully registered
  //               <div className="button-container">
  //                 <button
  //                   onClick={() => navigate("/")}
  //                   className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-[5px] text-sm px-5 py-2.5 text-center bg-primary-600 hover:bg-primary-700 focus:ring-primary-800"
  //                 >
  //                   Continue
  //                 </button>
  //               </div>
  //             </motion.div>
  //           ) : (
  //             renderForm
  //           )}
  //         </div>
  //       </div>
  //     </div>
  //   </motion.div>

  // );

  return (
    <motion.div
      className="flex justify-center items-center h-screen app"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="">
        <div
          className="logo-container mx-auto cursor-pointer"
          style={{ boxShadow: "0 8px 9px rgba(0, 0, 0, 0.5)" }}
        >
          <motion.img
            src={lock192}
            width="100px"
            height="99.88px"
            alt="ChatApp logo"
            variants={lock192Variants}
          />
        </div>
        <h1 className="text-xl font-bold leading-tight tracking-tight md:text-2xl text-white p-7 text-center">
          Create an Account
        </h1>
        <div className="w-full max-w-md">
          <motion.div
            className="border rounded-[8px] shadow p-6 bg-gray-800 border-gray-700 py-1"
            variants={formVariants}
          >
            <motion.div className="title text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl text-white" variants={titleVariants}>
              {/* <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl text-white px-6 mt-3">
                Create an Account
              </h1> */}
            </motion.div>
            {renderForm}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export default Register;
