import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState("");

  const formik = useFormik({
    initialValues: {
      identifier: "",
      password: "",
    },
    validationSchema: Yup.object({
      identifier: Yup.string().required("E-posta veya kullanıcı adı zorunludur"),
      password: Yup.string()
        .min(6, "Şifre en az 6 karakter olmalıdır")
        .required("Şifre zorunludur"),
    }),
    onSubmit: async (values) => {
      try {
        const response = await axios.post(
          "http://localhost:5000/api/auth/login",
          values
        );
        const { token, user } = response.data;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        // API istekleri için default header'a token'ı ekle
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Eğer protected bir sayfadan yönlendirildiyse oraya geri dön
        const from = location.state?.from?.pathname || "/";
        navigate(from);
      } catch (error) {
        setErrorMessage(
          error.response?.data?.error || "Giriş sırasında bir hata oluştu!"
        );
      }
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-8 shadow-lg rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center mb-6">Giriş Yap</h2>

        {location.state?.from && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <p className="text-yellow-700">
              Bu sayfaya erişmek için önce giriş yapmalısınız.
            </p>
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-50 text-red-500 p-3 rounded mb-4 text-sm">
            {errorMessage}
          </div>
        )}

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              E-posta veya Kullanıcı Adı
            </label>
            <input
              type="text"
              name="identifier"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 ${
                formik.touched.identifier && formik.errors.identifier
                  ? "border-red-500"
                  : ""
              }`}
              placeholder="ornek@email.com"
              {...formik.getFieldProps("identifier")}
            />
            {formik.touched.identifier && formik.errors.identifier && (
              <p className="mt-1 text-sm text-red-500">
                {formik.errors.identifier}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Şifre
            </label>
            <input
              type="password"
              name="password"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 ${
                formik.touched.password && formik.errors.password
                  ? "border-red-500"
                  : ""
              }`}
              placeholder="********"
              {...formik.getFieldProps("password")}
            />
            {formik.touched.password && formik.errors.password && (
              <p className="mt-1 text-sm text-red-500">
                {formik.errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={formik.isSubmitting}
            className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors ${
              formik.isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {formik.isSubmitting ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Hesabınız yok mu?{" "}
          <button
            onClick={() => navigate("/auth/register")}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Kayıt Ol
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;