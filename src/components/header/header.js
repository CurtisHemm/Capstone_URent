//imports
import Link from 'next/link';   //Import Link for client-side routing
import React, { useEffect, useState } from 'react';


const Header = () => {
  const [user, setUser] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null); // Track which dropdown is open
  
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
  
    return (
      <header>
        <nav className="navbar">
          <ul className="nav-links">
            <li><Link href="/">Home</Link></li>      
            {user ? (
              <>
              <li><Link href="/dashboard">Dashboard</Link></li>

              <li className="dropdown" onClick={() => toggleDropdown("preferences")}>
                <span>Preferences ▼</span>
                <ul className={`dropdown-menu ${openDropdown === "preferences" ? "show" : ""}`}>
                  <li><Link href="/preferences">Tenant Preferences</Link></li>
                  <li><Link href="/listings_preferences">Landlord Preferences</Link></li>
                </ul>
              </li>

              <li className="dropdown" onClick={() => toggleDropdown("matches")}>
                <span>Start Matching ▼</span>
                <ul className={`dropdown-menu ${openDropdown === "matches" ? "show" : ""}`}>
                  <li><Link href="/tenant_matches">Find Listings</Link></li>
                  <li><Link href="/landlord_matches">Find Tenants</Link></li>
                </ul>
              </li>

              <li className="dropdown" onClick={() => toggleDropdown("matches")}>
                <span>Accepted Matches ▼</span>
                <ul className={`dropdown-menu ${openDropdown === "matches" ? "show" : ""}`}>
                  <li><Link href="/tenant_accepted_matches">Listing's You Matched</Link></li>
                  <li><Link href="/landlord_accepted_matches">Tenant's You Matched</Link></li>
                </ul>
              </li>

              <li className="dropdown profile-menu" onClick={() => toggleDropdown("profile")}>
              <span>{user.first_name} Profile ▼</span>
                <ul className={`dropdown-menu ${openDropdown === "profile" ? "show" : ""}`}>
                  <li><Link href="/edit_password">Edit Password</Link></li>
                  <li><Link href="/all_listings">Your Listings</Link></li>
                  <li><button onClick={handleLogout} className="logout-button">Logout</button></li>
                </ul>
              </li>

              </>
            ) : (
              <li><Link href="/login">Login</Link></li>
            )}
          
          </ul>
        </nav>
      </header>
    );
  };
  
  export default Header;