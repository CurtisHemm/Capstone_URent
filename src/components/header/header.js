//imports
import Link from 'next/link';   
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const Header = () => {
  const [user, setUser] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null); 
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    // Fetch the user session from an API route
    console.log("Fetching user session...");
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/session', { credentials: 'include' });
        const data = await response.json();
        console.log("Session fetched:", data);
        setUser(data.user || null);
      } catch (error) {
        console.error("Failed to fetch user session:", error);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
    window.location.reload();
  };

  const toggleDropdown = (menu) => {

    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  const handleLinkClick = (e) => {
    setOpenDropdown(null);
    setIsMobileNavOpen(false);
    
    if (e.metaKey || e.ctrlKey) return; 

    e.preventDefault();
    router.push(e.currentTarget.getAttribute('href'));
  };

  const toggleMobileNav = () => {
    setIsMobileNavOpen(!isMobileNavOpen);
    setOpenDropdown(null); 
  };
  
    return (
      <header>
        <nav className="navbar">
        <button className="mobile-menu-button" onClick={toggleMobileNav} aria-label="Toggle navigation">
          {isMobileNavOpen ? '✕' : '☰'}
        </button>
          <ul className={`nav-links ${isMobileNavOpen ? 'mobile-show' : ''}`}>
            <li><Link href="/" onClick={() => setIsMobileNavOpen(false)}>Home</Link></li>      
            {user ? (
              <>
              <li><Link href="/dashboard" onClick={() => setIsMobileNavOpen(false)}>Dashboard</Link></li>

              <li className="dropdown" onClick={() => toggleDropdown("preferences")}>
                <span>Preferences ▼</span>
                <ul className={`dropdown-menu ${openDropdown === "preferences" ? "show" : ""}`} onClick={(e) => e.stopPropagation()}>
                  <li><Link href="/preferences" onClick={handleLinkClick} onTouchStart={handleLinkClick}>Tenant Preferences</Link></li>
                  <li><Link href="/listings_preferences" onClick={handleLinkClick} onTouchStart={handleLinkClick}>Landlord Preferences</Link></li>
                </ul>
              </li>

              <li className="dropdown" onClick={() => toggleDropdown("matches")}>
                <span>Start Matching ▼</span>
                <ul className={`dropdown-menu ${openDropdown === "matches" ? "show" : ""}`} onClick={(e) => e.stopPropagation()}>
                  <li><Link href="/tenant_matches" onClick={handleLinkClick} onTouchStart={handleLinkClick}>Find Listings</Link></li>
                  <li><Link href="/all_listings" onClick={handleLinkClick} onTouchStart={handleLinkClick}>Find Tenants</Link></li>
                </ul>
              </li>

              <li className="dropdown" onClick={() => toggleDropdown("acceptMatches")}>
                <span>Accepted Matches ▼</span>
                <ul className={`dropdown-menu ${openDropdown === "acceptMatches" ? "show" : ""}`} onClick={(e) => e.stopPropagation()}>
                  <li><Link href="/tenant_accepted_matches" onClick={handleLinkClick} onTouchStart={handleLinkClick}>Listing's You Matched</Link></li>
                  <li><Link href="/all_listings" onClick={handleLinkClick} onTouchStart={handleLinkClick}>Tenant's You Matched</Link></li>
                </ul>
              </li>

              <li className="dropdown profile-menu" onClick={() => toggleDropdown("profile")}>
              <span>{user.first_name} Profile ▼</span>
                <ul className={`dropdown-menu ${openDropdown === "profile" ? "show" : ""}`} onClick={(e) => e.stopPropagation()}>
                  <li><Link href="/edit_password" onClick={handleLinkClick} onTouchStart={handleLinkClick}>Edit Password</Link></li>
                  <li><Link href="/all_listings" onClick={handleLinkClick} onTouchStart={handleLinkClick}>Your Listings</Link></li>
                  <li><button onClick={handleLogout} className="logout-button">Logout</button></li>
                </ul>
              </li>

              </>
            ) : (
              <li><Link href="/login" onClick={() => setIsMobileNavOpen(false)}>Login</Link></li>
            )}
          
          </ul>
        </nav>
      </header>
    );
  };
  
  export default Header;