import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, gql } from "@apollo/client";

import "./styles.css";

const LOGIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      accessToken
    }
  }
`;
function Login() {
  const navigate = useNavigate();
  // React States
  const [errors, setErrors] = useState([]);
  const [formState, setFormState] = useState({
    username: "",
    password: "",
  });

  const [loginHandler] = useMutation(LOGIN, {
    onCompleted: ({login}) => {
      console.log(login)
      localStorage.setItem("auth-token", login.accessToken);
      localStorage.setItem("username", formState.username);
      navigate("/add_user");
      
    },
    onError: ({ graphQLErrors }) => {
      console.error(graphQLErrors);
      setErrors(graphQLErrors);
    },
  });
  
  // JSX code for login form
  const renderForm = (
    <div className="form">
      <div className="input-container">
        <label
          for="text"
          class="block mb-1 text-sm font-medium text-gray-900 dark:text-black"
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
          class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-white-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500"
          name="username"
          required
        />
      </div>
      <div className="input-container">
        <label
          for="text"
          class="block mb-1 text-sm font-medium text-gray-900 dark:text-black"
        >
          Password{" "}
        </label>
        <input
          type="password"
          value={formState.password}
          onChange={(e) =>
            setFormState({
              ...formState,
              password: e.target.value,
            })
          }
          class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-white-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
              class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"
              required=""
            />
          </div>
          <div class="ml-3 text-sm">
            <label for="remember" class="text-gray-500 dark:text-white-300">
              Remember me
            </label>
          </div>
        </div>
        <a
          href="#"
          class="text-sm font-medium text-primary-600 hover:underline dark:text-white-300"
        >
          Forgot password?
        </a>
      </div>
      <p>&nbsp;</p>
      <div className="button-container">
        <input
          type="submit"
          class="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
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
      <p>&nbsp;</p>
      <p class="text-sm font-light text-gray-500 dark:text-gray-400">
        Don’t have an account yet?{" "}
        <a
          href="#"
          class="font-medium text-primary-600 hover:underline dark:text-primary-500"
          onClick={() => navigate("/register")}
        >
          Sign up
        </a>
      </p>
    </div>
  );

  return (
    <div className="app">
      <div className="login-form w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
        <div className="title text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
          <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-black">
            Login to your Account
          </h1>
        </div>
        {renderForm}
      </div>
    </div>
  );
}

export default Login;