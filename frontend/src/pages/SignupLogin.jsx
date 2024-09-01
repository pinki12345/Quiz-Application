import React, { useState } from "react";
import styles from "./SignupLogin.module.css";
import axios from "axios";
import { endpoints } from "../services/apis";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { setLoading } from "../actions";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../components/Loader";

const SignupLogin = () => {
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.isLoading);
  const [isSignUp, setIsSignUp] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};

    if (isSignUp && !name) {
      newErrors.name = "Invalid name";
    }

    if (!email) {
      newErrors.email = "Invalid Email";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email format is invalid";
    }

    if (!password) {
      newErrors.password = "Weak password";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (isSignUp && password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };

  const handleSignup = async () => {
    const formErrors = validate();
    setErrors(formErrors);

    if (Object.keys(formErrors).length === 0) {
      const toastId = toast.loading("Creating account...");
      dispatch(setLoading(true));
      try {
        const response = await axios.post(endpoints.SIGNUP_API, {
          name,
          email,
          password,
          confirmPassword,
        });

        console.log("Signup response:", response.data);

        if (response.data.success) {
          toast.success("Account created successfully!", {
            position: "top-right",
          });
          setIsSignUp(false);
          setName("");
          setEmail("");
          setPassword("");
          setConfirmPassword("");
        } else {
          toast.error(
            response.data.message || "An error occurred. Please try again.",
            {
              position: "top-right",
            }
          );
        }
      } catch (error) {
        console.error("An error occurred:", error);
        if (error.response && error.response.status === 409) {
          toast.error("User already exists. Please log in to continue.", {
            position: "top-right",
          });
        } else {
          toast.error("An error occurred. Please try again.", {
            position: "top-right",
          });
        }
      } finally {
        toast.dismiss(toastId);
        dispatch(setLoading(false));
      }
    }
  };

  const handleLogin = async () => {
    const toastId = toast.loading("Logging in...");
    dispatch(setLoading(true));
    try {
      const response = await axios.post(endpoints.LOGIN_API, {
        email,
        password,
      });

      const token =
        response?.headers?.authorization?.split(" ")[1] ||
        response?.data?.token;

      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(response.data?.user));
        toast.success("Login successful!", {
          position: "top-right",
        });
        navigate("/home/dashboard");
      } else {
        toast.error("Token not found in response headers.", {
          position: "top-right",
        });
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          toast.error("Invalid email or password. Please try again.", {
            position: "top-right",
          });
          setErrors({ general: "Invalid email or password." });
        } else {
          toast.error(
            error.response.data.message ||
              "An error occurred. Please try again.",
            {
              position: "top-right",
            }
          );
          setErrors({
            general:
              error.response.data.message ||
              "An error occurred. Please try again.",
          });
        }
      } else {
        toast.error("An error occurred. Please try again.", {
          position: "top-right",
        });
        setErrors({ general: "An error occurred. Please try again." });
      }
    } finally {
      toast.dismiss(toastId);
      dispatch(setLoading(false));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSignUp) {
      handleSignup();
    } else {
      handleLogin();
    }
  };

  const handleChangeName = (e) => {
    setName(e.target.value);
    if (errors.name) {
      setErrors((prevErrors) => ({ ...prevErrors, name: null }));
    }
  };

  const handleChangeEmail = (e) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors((prevErrors) => ({ ...prevErrors, email: null }));
    }
  };

  const handleChangePassword = (e) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors((prevErrors) => ({ ...prevErrors, password: null }));
    }
  };

  const handleChangeConfirmPassword = (e) => {
    setConfirmPassword(e.target.value);
    if (errors.confirmPassword) {
      setErrors((prevErrors) => ({ ...prevErrors, confirmPassword: null }));
    }
  };

  if (isLoading) return <Loader />;

  return (
    <div className={styles.container}>
      <h1>QUIZZIE</h1>
      <div className={styles["form-container"]}>
        <div className={styles.tabs}>
          <button
            className={isSignUp ? styles.active : ""}
            onClick={() => setIsSignUp(true)}
          >
            Sign Up
          </button>
          <button
            className={!isSignUp ? styles.active : ""}
            onClick={() => setIsSignUp(false)}
          >
            Log In
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <div className={styles["form-group"]}>
              <label>Name</label>
              <input
                type="text"
                value={name}
                onChange={handleChangeName}
                className={errors.name ? styles["error-input"] : ""}
                placeholder={!errors.name ? "Name" : ""}
              />
              {errors.name && (
                <span className={styles["error-message"]}>{errors.name}</span>
              )}
            </div>
          )}
          <div className={styles["form-group"]}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={handleChangeEmail}
              className={errors.email ? styles["error-input"] : ""}
              placeholder={!errors.email ? "Email" : ""}
            />
            {errors.email && (
              <span className={styles["error-message"]}>{errors.email}</span>
            )}
          </div>
          <div className={styles["form-group"]}>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={handleChangePassword}
              className={errors.password ? styles["error-input"] : ""}
              placeholder={!errors.password ? "Password" : ""}
            />
            {errors.password && (
              <span className={styles["error-message"]}>{errors.password}</span>
            )}
          </div>
          {isSignUp && (
            <div className={styles["form-group"]}>
              <label>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={handleChangeConfirmPassword}
                className={errors.confirmPassword ? styles["error-input"] : ""}
                placeholder={!errors.confirmPassword ? "Confirm Password" : ""}
              />
              {errors.confirmPassword && (
                <span className={styles["error-message"]}>
                  {errors.confirmPassword}
                </span>
              )}
            </div>
          )}
          <button
            type="submit"
            className={
              isSignUp ? styles["submit-btn"] : styles["submit-btn-login"]
            }
          >
            {isSignUp ? "Sign Up" : "Log In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignupLogin;
