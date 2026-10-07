import { useState } from "react";

import Dashboard from "./components/Dashboard";
import LoginForm from "./components/LoginForm";

export default function App() {
  const [user, setUser] = useState(null);

  if (!user) {
    return <LoginForm onLogin={setUser} />;
  }

  return (
    <Dashboard
      user={user}
      onLogout={() => setUser(null)}
    />
  );
}
