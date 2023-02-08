import React, { useContext, useEffect, useState } from "react";
import { Form, Formik } from "formik";
import Card from "../../components/common/card/Card";
import Hyperlink from "../../components/common/buttons/Hyperlink";
import Label from "../../components/common/label/Label";
import FormInput from "../../components/FormInput";
import FormSuccess from "../../components/FormSuccess";
import FormError from "../../components/FormError";
import GradientBar from "../../components/common/gradientBar/GradientBar";
import { AuthContext } from "@context/AuthContext";
import { publicFetch } from "@utils/fetch";
import GradientButton from "../../components/common/buttons/GradientButton";
import { AxiosError } from "axios";
import { ICredentials } from "@interfaces/ICredentials";
import Image from "next/image";
import logo from "../../images/logo.png";
import { useRouter } from "next/router";
import Link from "next/link";
import s from "./Login.module.scss";

const Yup = require("yup");

const LoginSchema = Yup.object().shape({
  email: Yup.string().required("Email is required"),
  password: Yup.string().required("Password is required"),
});

const Login: React.FC = () => {
  const router = useRouter();
  const authContext = useContext(AuthContext);
  const [loginSuccess, setLoginSuccess] = useState<string>();
  const [loginError, setLoginError] = useState<string>();
  const [redirectOnLogin, setRedirectOnLogin] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  const submitCredentials = async (credentials: ICredentials) => {
    try {
      setLoginLoading(true);
      const { data } = await publicFetch.post(`authenticate`, credentials);

      authContext.setAuthState(data);
      setLoginSuccess(data.message);
      setLoginError("");

      setTimeout(() => {
        setRedirectOnLogin(true);
      }, 700);
    } catch (err) {
      setLoginLoading(false);
      if (err instanceof Error) {
        setLoginError(err.message);
      } else {
        const error = err as AxiosError;
        setLoginError(error?.response?.data.message || "Unexpected error");
      }
      setLoginSuccess("");
    }
  };

  useEffect(() => {
    if (redirectOnLogin) {
      router.push("/dashboard").then();
      // router.push("/").then();
    }
  }, [redirectOnLogin, router]);

  return (
    <>
      <section className="w-full sm:w-1/2 h-screen m-auto p-8 sm:pt-10">
        <GradientBar />
        <Card>
          <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
              <div>
                <div className="w-32 m-auto mb-6">
                  <Link href={"/"} shallow={false}>
                    <a className={s.logo}>
                      <Image src={logo} alt="Logo" width={150} height={32} />
                    </a>
                  </Link>
                </div>
                <h2 className="mb-2 text-center text-3xl leading-9 font-extrabold text-gray-900">
                  Log in to your account
                </h2>
                <p className="text-gray-600 text-center">
                  Don&apos;t have an account?{" "}
                  <Hyperlink to="signup" text="Sign up now" />
                </p>
              </div>

              <Formik
                initialValues={{
                  email: "",
                  password: "",
                }}
                onSubmit={(values: ICredentials) => submitCredentials(values)}
                validationSchema={LoginSchema}
              >
                {() => (
                  <Form className="mt-8">
                    {loginSuccess && <FormSuccess text={loginSuccess} />}
                    {loginError && <FormError text={loginError} />}
                    <div>
                      <div className="mb-2">
                        <div className="mb-1">
                          <Label text="Email" />
                        </div>
                        <FormInput
                          ariaLabel="Email"
                          name="email"
                          type="text"
                          placeholder="Email"
                        />
                      </div>
                      <div>
                        <div className="mb-1">
                          <Label text="Password" />
                        </div>
                        <FormInput
                          ariaLabel="Password"
                          name="password"
                          type="password"
                          placeholder="Password"
                        />
                      </div>
                    </div>

                    <div className="mt-6 flex justify-start">
                      <div className="text-sm leading-5">
                        <Hyperlink
                          to="forgot-password"
                          text="Forgot your password?"
                        />
                      </div>
                    </div>

                    <div className="mt-6">
                      <GradientButton type="submit" loading={loginLoading}>
                        Log In
                      </GradientButton>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </Card>
      </section>
    </>
  );
};

export default Login;
