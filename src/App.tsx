import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./router";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import { AppProvider } from "@/store/AppContext";
import ErrorBoundary from "@/components/base/ErrorBoundary";


function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <ErrorBoundary>
        <AppProvider>
          <BrowserRouter basename={__BASE_PATH__}>
            <AppRoutes />
          </BrowserRouter>
        </AppProvider>
      </ErrorBoundary>
    </I18nextProvider>
  );
}

export default App;