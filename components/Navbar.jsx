// 'use client'

// import Link from 'next/link'
// import { usePathname } from 'next/navigation'
// import { logoutAction } from '@/actions/logoutAction'
// import NotificationBell from './NotificationBell'
// import SearchBar from './SearchBar'

// const navLinks = [
//   { href: '/feed', label: 'Feed' },
//   { href: '/profile', label: 'Profile' },
// ]

// export default function Navbar({ userId }) {
//   const pathname = usePathname()

//   return (
//     <nav style={{
//       backgroundColor: 'var(--mv-surface)',
//       borderBottom: '0.5px solid var(--mv-border)',
//       height: '56px',
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'space-between',
//       padding: '0 24px',
//       gap: '16px',
//       position: 'sticky',
//       top: 0,
//       zIndex: 50,
//     }}>

//       {/* Logo */}
//       <Link href="/feed" style={{
//         fontFamily: 'Syne, sans-serif',
//         fontWeight: 700,
//         fontSize: '18px',
//         color: 'var(--mv-accent)',
//         textDecoration: 'none',
//         letterSpacing: '-0.3px',
//         flexShrink: 0,
//       }}>
//         SMA
//       </Link>

//       {/* Nav Links */}
//       <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
//         {navLinks.map(({ href, label }) => {
//           const isActive = pathname === href
//           return (
//             <Link key={href} href={href} style={{
//               fontFamily: 'Syne, sans-serif',
//               fontSize: '13px',
//               fontWeight: 500,
//               color: isActive ? 'var(--mv-text)' : 'var(--mv-muted)',
//               textDecoration: 'none',
//               padding: '6px 12px',
//               borderRadius: '8px',
//               backgroundColor: isActive ? 'var(--mv-surface-2)' : 'transparent',
//               transition: 'all 0.15s ease',
//             }}>
//               {label}
//             </Link>
//           )
//         })}
//       </div>

//       {/* Search bar — takes up remaining space in the middle */}
//       <SearchBar />

//       {/* Right side — bell + logout */}
//       <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>

//         <NotificationBell userId={userId} />

//         <form action={logoutAction}>
//           <button type="submit" style={{
//             fontFamily: 'Syne, sans-serif',
//             fontSize: '13px',
//             fontWeight: 500,
//             color: 'var(--mv-muted)',
//             backgroundColor: 'transparent',
//             border: '0.5px solid var(--mv-border)',
//             borderRadius: '8px',
//             padding: '6px 14px',
//             cursor: 'pointer',
//             transition: 'all 0.15s ease',
//           }}
//           onMouseEnter={e => {
//             e.currentTarget.style.color = 'var(--mv-text)'
//             e.currentTarget.style.borderColor = 'var(--mv-primary)'
//           }}
//           onMouseLeave={e => {
//             e.currentTarget.style.color = 'var(--mv-muted)'
//             e.currentTarget.style.borderColor = 'var(--mv-border)'
//           }}>
//             Logout
//           </button>
//         </form>

//       </div>
//     </nav>
//   )
// }

"use client";

import Link from "next/link";
import NotificationBell from "./NotificationBell";
import SearchBar from "./SearchBar";

export default function Navbar({ userId }) {
  return (
    <nav
      style={{
        backgroundColor: "var(--mv-surface)",
        borderBottom: "0.5px solid var(--mv-border)",
        height: "56px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        gap: "16px",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Logo */}
      <Link
        href="/feed"
        style={{
          fontFamily: "Syne, sans-serif",
          fontWeight: 700,
          fontSize: "18px",
          color: "var(--mv-accent)",
          textDecoration: "none",
          letterSpacing: "-0.3px",
          flexShrink: 0,
        }}
      >
        SMA
      </Link>

      {/* Search bar — takes up remaining space in the middle */}
      <SearchBar />

      {/* Right side — notification bell only */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexShrink: 0,
        }}
      >
        <NotificationBell userId={userId} />
      </div>
    </nav>
  );
}
