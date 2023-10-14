import { type AppType } from "next/app";

import { api } from "~/utils/api";
import '@mantine/core/styles.css'

import "~/styles/globals.css";
import { Provider } from "react-redux";
import store from "~/store/store";
import { ClerkProvider, SignIn } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import { MantineProvider } from "@mantine/core";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <ClerkProvider>
        <MantineProvider>
          <Provider store={store}>
            <Toaster position="top-right" />
            <Component {...pageProps} />
          </Provider>
        </MantineProvider>
      </ClerkProvider>
    </>
  );
};

export default api.withTRPC(MyApp);
