import { type AppType } from "next/app";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { Provider } from "react-redux";
import store from "~/store/store";
import { ClerkProvider, SignIn } from '@clerk/nextjs'
import { Toaster } from "react-hot-toast";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
    <ClerkProvider>

      <Provider store={store}>
      <Toaster position="top-right"/>
        <Component {...pageProps} />
      </Provider>
      </ClerkProvider>
    </>
  );
};

export default api.withTRPC(MyApp);
