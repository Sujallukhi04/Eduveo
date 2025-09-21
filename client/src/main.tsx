import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { ProtectedRoute } from "./components/protectedRoutes.tsx";
import { AuthProvider } from "./components/providers/auth.tsx";
import { ThemeProvider } from "./components/providers/theme-provider.tsx";
import { SessionProvider } from "./contexts/SessionContext.tsx";
import RegisterServiceWorker from "./components/RegisterServiceWorker.tsx";
import GroupsPage from "./pages/Group.tsx";
import StudyGroupPage from "./pages/Group_page.tsx";
import Home from "./pages/Home.tsx";
import NotFoundPage from "./pages/Notfoundpage.tsx";
import { Toaster } from "sonner";
import "./style.css";
import { Board } from "./components/main-board/Board.tsx";
import Signup from "./pages/Signup.tsx";
import Login from "./pages/Login.tsx";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      {/* custom cursor */}
      {/* <CustomCursor /> */}
      <AuthProvider>
        <SessionProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/groups"
                element={
                  <ProtectedRoute>
                    <RegisterServiceWorker />
                    <GroupsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/groups/:groupId"
                element={
                  <ProtectedRoute>
                    <RegisterServiceWorker />
                    <StudyGroupPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/groups/:groupId/board/:boardId"
                element={
                  <ProtectedRoute>
                    <RegisterServiceWorker />
                    <Board />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </SessionProvider>
      </AuthProvider>
      <Toaster richColors theme="dark" />
    </ThemeProvider>
  </StrictMode>
);
