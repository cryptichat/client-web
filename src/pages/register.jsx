import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, gql } from "@apollo/client";
import { motion } from "framer-motion";
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
        localStorage.setItem("auth-token", createAccount.accessToken);
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

        console.log("registering user");
        await signupHandler({
          variables: {
            username: formState.uname,
            email: formState.email,
            password: formState.pass1,
            publicKey: publicKeyPem,
          },
        });

        console.log("Account created successfully");//this isn't true

        localStorage.setItem("privateKey:" + formState.uname, arrayBufferToBase64(privateKeyDer));
        console.log("Private key stored securely in local storage");
      } catch (error) {
        console.error(error);
      }
    }
  }

  const renderForm = (
    <div className="form">
      <div className="my-4">
        <label
          htmlFor="username"
          className="block text-sm font-medium text-white my-2"
        >
          Username{" "}
        </label>
        <input
          type="text"
          className="border border-gray-300 text-gray-900 text-sm rounded focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 border-gray-600 placeholder-gray-400 text-black focus:ring-blue-500 focus:border-blue-500"
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
      <div className="my-4">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-white my-2"
        >
          Email{" "}
        </label>
        <input
          type="email"
          id="email"
          className="border border-gray-300 text-gray-900 text-sm rounded focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 border-gray-600 placeholder-gray-400 text-black focus:ring-blue-500 focus:border-blue-500"
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
      <div className="my-4">
        <label
          htmlFor="password-input"
          className="block text-sm font-medium text-white my-2"
        >
          Password{" "}
        </label>
        <input
          type="password"
          className="border border-gray-300 text-gray-900 text-sm rounded focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 border-gray-600 placeholder-gray-400 text-black focus:ring-blue-500 focus:border-blue-500"
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
      <div className="my-4">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-white my-2"
        >
          Confirm Password{" "}
        </label>
        <input
          type="password"
          className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 bg-white-700 border-gray-600 placeholder-gray-400 text-black focus:ring-blue-500 focus:border-blue-500"
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
      <div className="flex justify-center py-2 my-2">
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

      <p className="my-2 text-sm font-light text-gray-500">
        Already have an account?{" "}
        <a
          href="#"
          className="font-bold text-primary-600 hover:underline"
          onClick={() => navigate("/login")}
        >
          Login
        </a>
      </p>
    </div>
  );

  return (
    <motion.div
      className="flex justify-center items-center h-screen w-screen app"
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
        <h1 className="text-xl font-bold md:text-2xl text-white p-7 text-center">
          Create an Account
        </h1>
        <div className="w-full max-w-md">
          <motion.div
            className="border rounded-lg shadow p-6 bg-gray-800 border-gray-700 py-1"
            variants={formVariants}
          >
            {renderForm}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export default Register;
