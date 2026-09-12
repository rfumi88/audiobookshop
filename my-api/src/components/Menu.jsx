import { NavLink } from 'react-router-dom';
import { useContext } from 'react';
import { ThemeContext } from './ThemeContext';
import { AuthContext } from './AuthContext';

function Menu() {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const { user, logout } = useContext(AuthContext);

    const isAdmin = user?.id_role === 1 || user?.role_id === 1 || user?.role_name === 'Администратор';

    const linkClass = ({ isActive }) =>
        isActive ? 'menu-link active' : 'menu-link';

    return (
        <nav className="menu">
            <NavLink to="/" className={linkClass}>Каталог</NavLink>
            <NavLink to="/cart" className={linkClass}>Корзина</NavLink>

            {!user && (
                <>
                    <NavLink to="/login" className={linkClass}>Вход</NavLink>
                    <NavLink to="/register" className={linkClass}>Регистрация</NavLink>
                </>
            )}

            {user && (
                <>
                    <span className="menu-user">Пользователь: {user.first_name}</span>

                    {isAdmin && (
                        <NavLink to="/admin" className={linkClass}>Админ-панель</NavLink>
                    )}

                    <button onClick={logout} className="menu-button">Выйти</button>
                </>
            )}

            <button onClick={toggleTheme} className="menu-button theme-button">
                {theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
            </button>
        </nav>
    );
}

export default Menu;