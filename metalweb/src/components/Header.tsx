// src/components/Header.tsx
import { Navbar, Alignment, Button } from '@blueprintjs/core';
import { NavLink } from 'react-router-dom';
import logo from '@/assets/images/nextmetal.svg';

export default function Header() {
  // Example auth state—replace with real hook later
  const userLoggedIn = false;

  return (
    <Navbar fixedToTop className="bp5-dark">
      <Navbar.Group align={Alignment.CENTER}>
        <NavLink to="/">
          <img src={logo} alt="NextMetal" className="h-6 mr-2" />
        </NavLink>
      </Navbar.Group>

      <Navbar.Group align={Alignment.RIGHT} className="space-x-3">
        <NavLink to="/vision#section1">Vision</NavLink>
        <NavLink to="/beta">AI Chat</NavLink>
        <NavLink to="/storage">Storage</NavLink>
        <NavLink to="/hosting">Hosting</NavLink>
        <NavLink to="/models">Models</NavLink>
        <NavLink to="/agents">Agents</NavLink>
        <NavLink to="/careers">Careers</NavLink>
        {userLoggedIn ? (
          <Button minimal text="Logout" intent="danger" />
        ) : (
          <Button minimal text="Log in / Sign up" intent="primary" />
        )}
      </Navbar.Group>
    </Navbar>
  );
}