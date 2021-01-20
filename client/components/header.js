import Link from 'next/link'

const Header = ({user}) => {
    const links = [
        {label: 'Home', href: '/'},
        !user && {label: 'Sign Up', href: '/auth/signup'},
        !user && {label: 'Sign In', href: '/auth/signin'},
        user && {label: 'Sell Tickets', href: '/tickets/new'},
        user && {label: 'My Orders', href: '/orders'},
        user && {label: 'Sign Out', href: '/auth/signout'},
    ].filter(linkConfig => linkConfig).map(({label, href}) => (
        <li className='nav-item' key={href} >
            <Link href={href}>
                <a className="nav-link">{label}</a>
            </Link>
        </li>
    ))

    return (
        <nav className="navbar navbar-light bg-light">
            <Link href='/'>
                <a className="navbar-brand">TixAPP</a>
            </Link>
            <div className="d-flex justify-content-end">
                <ul className="nav d-flex align-items-center" style={{color: 'white'}}>
                    {links}
                </ul>
            </div>
        </nav>
    )
}

export default Header