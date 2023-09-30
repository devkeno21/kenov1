import { type AppType } from "next/app";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { Provider } from "react-redux";
import store from "~/store/store";
import { ClerkProvider, SignIn } from '@clerk/nextjs'

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
    <ClerkProvider>

      <Provider store={store}>
        <Component {...pageProps} />
      </Provider>
      </ClerkProvider>
    </>
  );
};

export default api.withTRPC(MyApp);
