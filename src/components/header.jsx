import React, { useState } from "react";
import { Link } from "react-router-dom";
import './css/header.css';
import { useProfile } from "./profiles/profileContext.jsx";

const Header = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { activeProfile, resetToDefaultProfile } = useProfile();
    const displayName = activeProfile
        ? [activeProfile.firstName, activeProfile.lastName].filter(Boolean).join(' ')
        : 'Default';

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    const handleLogout = () => {
        resetToDefaultProfile();
        closeMobileMenu();
    };

    return (
        <>
            <div style={{ display: 'inline' }}>
                <nav className="Nav">
                    <Link className="set-link-size" to="/dashboard" onClick={closeMobileMenu}>
                        <img className="logoNav" src={require("./images/SchoolDayLogo.png")} alt="Logo" />
                    </Link>
                    <div className={`header ${isMobileMenuOpen ? 'open' : ''}`}>
                        <span className="header-profile">Profile: {displayName}</span>
                        <span className="closebtn" onClick={closeMobileMenu}>&times;</span>
                        <Link to="/" onClick={handleLogout}>Logout</Link>
                    </div>
                    <div className="hamburger" onClick={toggleMobileMenu}>
                        &#9776; {/* Hamburger icon */}
                    </div>
                </nav>
            </div>
        </>
    );
}

export default Header;
