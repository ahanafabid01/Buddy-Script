import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import FeedPage from "./pages/FeedPage";
import LoginPage from "./pages/LoginPage";
import CommentReactionsPage from "./pages/CommentReactionsPage";
import PostCommentsPage from "./pages/PostCommentsPage";
import PostReactionsPage from "./pages/PostReactionsPage";
import RegisterPage from "./pages/RegisterPage";
import { useAuth } from "./context/AuthContext";

function PublicOnlyRoute({ children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="app-loading">Loading...</div>;
  }

  if (user) {
    return <Navigate to="/feed" replace />;
  }

  return children;
}

export default function App() {
  const location = useLocation();
  const backgroundLocation = location.state?.backgroundLocation;

  return (
    <>
      <Routes location={backgroundLocation || location}>
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          }
        />
        <Route element={<ProtectedRoute />}>
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/feed/comment/:commentId/reactions" element={<CommentReactionsPage />} />
          <Route path="/feed/post/:postId" element={<PostCommentsPage />} />
          <Route path="/feed/post/:postId/reactions" element={<PostReactionsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/feed" replace />} />
      </Routes>

      {backgroundLocation ? (
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/feed/post/:postId" element={<PostCommentsPage modal />} />
          </Route>
        </Routes>
      ) : null}
    </>
  );
}

