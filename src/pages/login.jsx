import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, gql } from "@apollo/client";
import { motion } from "framer-motion";
import lock192 from "./lock192.png";
import "./styles.css";

const LOGIN = gql`
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
    onCompleted: ({ login }) => {
      console.log(login)
      localStorage.setItem("auth-token", login.accessToken);
      navigate("/");
    },
    onError: ({ graphQLErrors }) => {
      console.error(graphQLErrors);
      setErrors(graphQLErrors);
    },
  });

  const renderForm = (
    <div className="form rounded-[10px]">
      <div className="input-container">
        <label
          for="text"
          class="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
        >
          Username{" "}
        </label>
        <input
          type="text"
          value={formState.username}
          onChange={(e) =>
            setFormState({
              ...formState,
              username: e.target.value,
            })
          }
          class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-[5px] focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-white-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500"
          name="username"
          required
        />
      </div>
      <div className="input-container">
        <label
          for="text"
          class="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
        >
          Password{" "}
        </label>
        <input type="password"
          value={formState.password}
          onChange={(e) =>
            setFormState({
              ...formState,
              password: e.target.value,
            })
          }
          class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-[5px] focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-white-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500"
          name="password"
          required
        />
      </div>
      <div class="flex items-center justify-between">
        <div class="flex items-start">
          <div class="flex items-center h-5">
            <input
              id="remember"
              aria-describedby="remember"
              type="checkbox"
              class="mx-3 w-4 h-4 border border-gray-300 rounded-lg bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"
              required=""
            />
          </div>
          <div class="text-sm">
            <label for="remember" class="text-gray-500 dark:text-white-300">
              Remember me
            </label>
          </div>
        </div>
        <a
          href="#"
          class="px-2 text-sm font-medium text-primary-600 hover:underline dark:text-white-300"
        >
          Forgot password?
        </a>
      </div>
      <div className="button-container">
        <input
          type="submit"
          value="Login"
          class="w-full text-white bg-purple-900 hover:bg-purple-900 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-[5px] text-sm text-center dark:bg-[#4c1d95] dark:hover:bg-[#4c1d95] dark:focus:ring-[#4c1d95]"
          onClick={() =>
            loginHandler({
              variables: formState,
            })
          }
        />
      </div>
      <div>
        {errors.map((error) => (
          <div className="error">{error.message}</div>
        ))}
      </div>
      <p class="my-2 text-sm font-light text-gray-500 dark:text-gray-400">
        Don’t have an account yet?{" "}
        <a
          href="#"
          class="font-medium text-primary-600 hover:underline dark:text-primary-500"
          onClick={() => navigate("/register")}
        >
          Sign up
        </a>
      </p>
    </div>);

  return (
    <motion.div
      className="flex justify-center items-center h-screen app"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="">
        <div className="chatcontainer"></div>
        <div className="container mx-auto cursor-pointer" style={{ boxShadow: "0 8px 9px rgba(0, 0, 0, 0.5)" }}>
          <motion.img
            src={lock192}
            width="100px"
            height="99.88px"
            alt="ChatApp logo"
            variants={lock192Variants}
          />
        </div>
        <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white p-7 text-center">
          Welcome to CrypticChat
        </h1> <div className="w-full max-w-md">
          <motion.div
            className="border bg-white rounded-[8px] shadow p-6 dark:bg-gray-800 dark:border-gray-700"
            variants={formVariants}
          >
            <motion.div
              className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white text-center"
              variants={titleVariants}
            >
              <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
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


