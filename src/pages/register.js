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
    uname: "invalid username",
    pass1: "invalid password"

  };

  const handleSubmit = (event) => {
    //Prevent page reload
    event.preventDefault();

    var { uname, email, pass1, pass2 } = document.forms[0];

    // Find user login info
    const userData = database.find((user) => user.username === uname.value);

    // Compare user info
    if (userData) {
      if (userData.password !== pass1.value) {
        // Invalid password
        setErrorMessages({ name: "pass", message: errors.pass1 });
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
          <label>Username </label>
          <input type="text" name="uname" required />
          {renderErrorMessage("uname")}
        </div>
        <div className="input-container">
          <label>Email </label>
          <input type="text" name="uname" required />
          {renderErrorMessage("email")}
        </div>
        <div className="input-container">
          <label>Password </label>
          <input type="password" name="pass1" required />
          {renderErrorMessage("pass1")}
        </div>
        <div className="input-container">
          <label>Re-Password </label>
          <input type="password" name="pass2" required />
          {renderErrorMessage("pass2")}
        </div>
        <div className="button-container">
          <input type="submit" />
        </div>
      </form>
    </div>
  );

  return (
    <div className="app">
      <div className="login-form">
        <div className="title">Register</div>
        {isSubmitted ? <div>User is successfully registered</div> : renderForm}
      </div>
    </div>
  )
}

export default Register
