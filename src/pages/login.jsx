import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, gql } from "@apollo/client";
import { motion } from "framer-motion";
import lock192 from "./lock192.png";
import "./styles.css";

export const LOGIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
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
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, type: "spring", stiffness: 60 } },
};

const formVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, type: "spring", stiffness: 60 } },
};

const lock192Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.5, type: "spring", stiffness: 60 } },
};

function Login() {
  const navigate = useNavigate();
  const [errors, setErrors] = useState([]);
  const [formState, setFormState] = useState({
    username: "",
    password: "",
  });

  const [loginHandler] = useMutation(LOGIN, {
    onCompleted: async ({ login }) => {
      // Define a function that returns a Promise to set localStorage items
      // const setLocalStorageItems = () => {
      // return new Promise((resolve) => {
      //   setTimeout(1000);
      //   resolve();
      // });
      // };

      // Call the function and wait for it to complete before navigating
      localStorage.setItem("auth-token", login.accessToken);
      //await setLocalStorageItems();
      window.location.href = "/";
    },
    onError: ({ graphQLErrors }) => {
      console.error(graphQLErrors);
      setErrors(graphQLErrors);
    },
  });

  const renderForm = (
    <div>
      <div className="flex flex-col mx-2.5 my-4 gap-2">
        <label htmlFor="username" className="block text-sm font-medium text-white">Username</label>
        <input
          type="text"
          value={formState.username}
          onChange={(e) =>
            setFormState({
              ...formState,
              username: e.target.value,
            })
          }
          className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 bg-white-700 border-gray-600 placeholder-gray-400 text-black focus:ring-blue-500 focus:border-blue-500"
          name="username"
          id="username"
          required
        />
      </div>
      <div className="flex flex-col mx-2.5 my-4 gap-2">
        <label htmlFor="password" className="block text-sm font-medium text-gray-900 text-white">Password</label>
        <input type="password"
          value={formState.password}
          onChange={(e) =>
            setFormState({
              ...formState,
              password: e.target.value,
            })
          }
          className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 bg-white-700 border-gray-600 placeholder-gray-400 text-black focus:ring-blue-500 focus:border-blue-500"
          name="password"
          id="password"
          required
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-start py-2">
          <div className="flex items-center h-5">
            <input
              id="remember"
              aria-describedby="remember"
              type="checkbox"
              className="mx-3 w-4 h-4 border border-gray-300 rounded-lg bg-gray-50 focus:ring-3 focus:ring-primary-300 bg-gray-700 border-gray-600 focus:ring-primary-600 ring-offset-gray-800"
              required=""
            />
          </div>
          <div className="text-sm">
            <label htmlFor="remember" className="text-gray-500 text-white-300">Remember me</label>
          </div>
        </div>
        <a href="#" className="px-2 text-sm font-medium text-primary-600 hover:underline text-white-300">Forgot password?</a>
      </div>
      <div className="flex justify-center">
        <input
          type="submit"
          value="Login"
          className="w-full mt-2.5 text-white font-medium rounded text-sm text-center bg-[#8b5cf6] hover:bg-[#4c1d95] py-2 cursor-pointer"
          onClick={() =>
            loginHandler({
              variables: formState,
            })
          }
        />
      </div>
      <div>
        {errors.map((error, index) => (
          <div key={index} className="error">{error.message}</div>
        ))}
      </div>
      <p className="mt-4 text-sm text-center font-light text-gray-500">
        Don’t have an account yet?{" "}
        <a
          href="#"
          className="font-bold text-primary-600 hover:underline"
          onClick={() => navigate("/register")}
        >
          Sign up
        </a>
      </p>
    </div>);

  return (
    <motion.div
      className="flex justify-center items-center h-screen w-screen app"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="">
        <div className="logo-container mx-auto cursor-pointer">
          <motion.img
            src={lock192}
            width="100px"
            height="99.88px"
            alt="ChatApp logo"
            variants={lock192Variants}
          />
        </div>
        <h1 className="text-xl font-bold md:text-2xl text-white p-7 text-center">
          Welcome to CrypticChat
        </h1>
        <div className="w-full max-w-md">
          <motion.div
            className="border rounded-lg shadow p-4 bg-gray-800 border-gray-700"
            variants={formVariants}
          >
            <motion.div variants={titleVariants}>
              <h1 className="text-xl mb-5 font-bold text-gray-900 md:text-2xl text-white px-6 mt-3">
                Login to your Account
              </h1>
            </motion.div>
            {renderForm}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
export default Login;


