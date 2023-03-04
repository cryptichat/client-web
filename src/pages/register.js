import React, { useState } from 'react'
import ReactDOM from "react-dom";

import "./styles.css";
function Register() {
  // React States
  const [errorMessages, setErrorMessages] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // User Login info
  const database = [
    {
      username: "user1",
      password: "pass1"
    },
    {
      username: "user2",
      password: "pass2"
    }
  ];

  const errors = {
    uname: "Username is already taken",
    email: "Wrong email format",
    pass1: "Passwords don't match"


  };

  const handleSubmit = (event) => {
    //Prevent page reload
    event.preventDefault();

    var { uname, email, pass1, pass2 } = document.forms[0];

    // Find user login info
    const userData = database.find((user) => user.username === uname.value);

    // Compare user info
    if (!userData) {
      if (pass1.value !== pass2.value) {
        // Invalid password
        setErrorMessages({ name: "pass1", message: errors.pass1 });
      } else {
        setIsSubmitted(true);
      }
    } else {
      // Username not found
      setErrorMessages({ name: "uname", message: errors.uname });
    }
  };

  // Generate JSX code for error message
  const renderErrorMessage = (name) =>
    name === errorMessages.name && (
      <div className="error">{errorMessages.message}</div>
    );

  // JSX code for login form
  const renderForm = (
    <div className="form">
      <form onSubmit={handleSubmit}>
        <div className="input-container">
          <label for="text" class="block mb-2 text-sm font-medium text-gray-900 dark:text-black">Username </label>
          <input type="text" class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-white-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500" name="uname" required />
          {renderErrorMessage("uname")}
        </div>
        <div className="input-container">
          <label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-black">Email </label>
          <input type="email" class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-white-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500" name="email" required />
          {renderErrorMessage("email")}
        </div>
        <div className="input-container">
          <label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-black">Password </label>
          <input type="password" class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-white-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500" name="pass1" required />
          {renderErrorMessage("pass1")}
        </div>
        <div className="input-container">
          <label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-black">Re-Password </label>
          <input type="password" class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-white-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500" name="pass2" required />
          {renderErrorMessage("pass2")}
        </div>
        <div className="button-container">
          <input type="submit" class="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800" />
        </div>
      </form>
    </div>
  );

  return (
    <div className="app">
      <div className="login-form w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
        <div className="title text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
          <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-black">
            Register
          </h1>
        </div>
        {isSubmitted ? <div>User is successfully registered</div> : renderForm}
      </div>
    </div>
  )
}

export default Register
