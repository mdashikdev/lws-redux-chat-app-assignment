import getAvatar from "gravatar-url";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import logoImage from "../../assets/images/lws-logo-dark.svg";
import { userLoggedOut } from "../../features/auth/authSlice";

export default function Navigation() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth) || {};

  const logout = () => {
    dispatch(userLoggedOut());
    localStorage.clear();
  };
  return (
    <nav className="border-general sticky top-0 z-40 border-b bg-violet-700 transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between h-16 items-center">
          <Link to="/">
            <img className="h-10" src={logoImage} alt="Learn with Sumit" />
          </Link>
          <ul className="flex gap-2 items-center">
            <li className="flex gap-2 items-center text-white">
              <img
                className="object-cover w-10 h-10 rounded-full"
                src={getAvatar(user.email, {
                  size: 80,
                })}
                alt={user.name}
              />
              <strong>{user.name}</strong>
            </li>
            <li className="text-white">
              <span className="cursor-pointer" onClick={logout}>
                Logout
              </span>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
