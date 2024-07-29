import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function PrivateRoute({ children }) {
    const isLoggedIn = useAuth();
    // const isLoggedIn = true;

    return isLoggedIn ? children : <Navigate to="/" />;
}
