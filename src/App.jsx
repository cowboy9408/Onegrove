import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./AppRoutes";
import { SidebarProvider } from "./context/SidebarProvider";
import { ThemeProvider } from "./context/ThemeProvider";
import LoadingSpinner from "./components/common/LoadingSpinner";
import { ModalProvider } from "./context/ModalProvider";

function App() {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <BrowserRouter>
          <ModalProvider>
            <AppRoutes />
            <LoadingSpinner />
          </ModalProvider>
        </BrowserRouter>
      </SidebarProvider>
    </ThemeProvider>
  );
}

export default App;
