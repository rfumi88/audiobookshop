import { useCallback, useContext, useEffect, useState } from 'react';
import { getAdminServices, updateServiceDiscount } from '../api/services';
import { getAdminUsers, updateUserDiscount } from '../api/users';
import { getCategories, createCategory, deleteCategory } from '../api/categories';
import { AuthContext } from './AuthContext';

const PAGE_SIZE = 5;

function Pagination({ page, pages, setPage }) {
    if (pages <= 1) return null;

    return (
        <div className="pagination">
            <button className="button" disabled={page === 1} onClick={() => setPage(page - 1)}>Назад</button>
            <span className="pagination-info">Страница {page} из {pages}</span>
            <button className="button" disabled={page === pages} onClick={() => setPage(page + 1)}>Вперёд</button>
        </div>
    );
}

function AdminPanel() {
    const { user } = useContext(AuthContext);
    const [categories, setCategories] = useState([]);
    const [services, setServices] = useState({ items: [], total: 0, page: 1, pages: 1 });
    const [users, setUsers] = useState({ items: [], total: 0, page: 1, pages: 1 });
    const [serviceSearch, setServiceSearch] = useState('');
    const [userSearch, setUserSearch] = useState('');
    const [servicePage, setServicePage] = useState(1);
    const [userPage, setUserPage] = useState(1);
    const [newCategory, setNewCategory] = useState('');
    const [newCategoryDescription, setNewCategoryDescription] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const isAdmin = user?.id_role === 1 || user?.role_id === 1 || user?.role_name === 'Администратор';
    const loadData = useCallback(() => {
        setLoading(true);
        setError('');

        return Promise.all([
            getCategories(),
            getAdminServices(serviceSearch, servicePage, PAGE_SIZE),
            getAdminUsers(userSearch, userPage, PAGE_SIZE)
        ])
            .then(([categories, services, users]) => {
                setCategories(Array.isArray(categories) ? categories : []);

                setServices(Array.isArray(services)
                    ? { items: services, total: services.length, page: 1, pages: 1 }
                    : {
                        items: services?.items || [],
                        total: Number(services?.total) || 0,
                        page: Number(services?.page) || 1,
                        pages: Number(services?.pages) || 1
                    });

                setUsers(Array.isArray(users)
                    ? { items: users, total: users.length, page: 1, pages: 1 }
                    : {
                        items: users?.items || [],
                        total: Number(users?.total) || 0,
                        page: Number(users?.page) || 1,
                        pages: Number(users?.pages) || 1
                    });
            })
            .catch(error => setError(error.message || 'Не удалось загрузить данные'))
            .finally(() => setLoading(false));
    }, [serviceSearch, servicePage, userSearch, userPage]);

    useEffect(() => {
        if (!isAdmin) return;

        const timer = setTimeout(loadData, 0);
        return () => clearTimeout(timer);
    }, [isAdmin, loadData]);

    useEffect(() => {
        const update = () => loadData();

        window.addEventListener('categoriesUpdated', update);
        return () => window.removeEventListener('categoriesUpdated', update);
    }, [loadData]);

    const addCategory = () => {
        if (!newCategory.trim()) {
            setError('Введите название категории');
            return;
        }

        setError('');
        setSuccess('');

        createCategory({ category_name: newCategory, description: newCategoryDescription })
            .then(() => {
                setNewCategory('');
                setNewCategoryDescription('');
                setSuccess('Категория добавлена');
                window.dispatchEvent(new Event('categoriesUpdated'));
            })
            .catch(error => setError(error.message || 'Не удалось добавить категорию'));
    };

    const removeCategory = id => {
        setError('');
        setSuccess('');

        deleteCategory(id)
            .then(() => {
                setSuccess('Категория удалена');
                window.dispatchEvent(new Event('categoriesUpdated'));
            })
            .catch(error => setError(error.message || 'Не удалось удалить категорию'));
    };

    const saveServiceDiscount = (id, value) => {
        setError('');
        setSuccess('');

        updateServiceDiscount(id, Number(value))
            .then(() => {
                setSuccess('Скидка на аудиокнигу изменена');
                loadData();
            })
            .catch(error => setError(error.message || 'Не удалось изменить скидку'));
    };

    const saveUserDiscount = (id, coupon, value) => {
        setError('');
        setSuccess('');

        updateUserDiscount(id, coupon, Number(value))
            .then(() => {
                setSuccess('Персональная скидка изменена');
                loadData();
            })
            .catch(error => setError(error.message || 'Не удалось изменить скидку'));
    };

    if (!user) {
        return (
            <div className="page">
                <h2>Админ-панель</h2>
                <div className="error">Необходимо войти в аккаунт</div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="page">
                <h2>Админ-панель</h2>
                <div className="error">Доступ разрешён только администратору</div>
            </div>
        );
    }

    return (
        <div className="page">
            <h1>Админ-панель</h1>

            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}

            <section className="admin-section">
                <h2>Категории</h2>

                <div className="admin-inline">
                    <input className="input medium-input" placeholder="Название категории" value={newCategory} onChange={e => setNewCategory(e.target.value)} />
                    <input className="input medium-input" placeholder="Описание" value={newCategoryDescription} onChange={e => setNewCategoryDescription(e.target.value)} />
                    <button className="button" onClick={addCategory}>Добавить</button>
                </div>

                {categories.map(category => (
                    <div className="admin-item" key={category.id_category}>
                        <strong>{category.category_name}</strong>
                        {category.description && ` — ${category.description}`}
                        <button className="button" onClick={() => removeCategory(category.id_category)}>Удалить</button>
                    </div>
                ))}
            </section>

            <section className="admin-section">
                <h2>Аудиокниги</h2>

                <input
                    className="input search-input"
                    placeholder="Поиск по названию или автору..."
                    value={serviceSearch}
                    onChange={e => {
                        setServiceSearch(e.target.value);
                        setServicePage(1);
                    }}
                />

                <p>Найдено аудиокниг: {services.total}</p>

                {loading ? (
                    <div>Загрузка...</div>
                ) : services.items.length === 0 ? (
                    <div>Аудиокниги не найдены</div>
                ) : (
                    <>
                        {services.items.map(service => (
                            <div className="admin-item" key={service.id_service}>
                                <h3>{service.service_name}</h3>
                                <p>Автор: {service.author}</p>
                                <p>Цена: {service.price} ₽</p>

                                {service.discount_percent > 0 && (
                                    <p className="discount">Текущая скидка: {service.discount_percent}%</p>
                                )}

                                <div className="admin-inline">
                                    <label>Скидка (%):</label>
                                    <input
                                        className="input small-input"
                                        type="number"
                                        min="0"
                                        max="100"
                                        defaultValue={service.discount_percent || 0}
                                        id={`service-${service.id_service}`}
                                    />
                                    <button
                                        className="button"
                                        onClick={() => saveServiceDiscount(
                                            service.id_service,
                                            document.getElementById(`service-${service.id_service}`).value
                                        )}
                                    >
                                        Сохранить
                                    </button>
                                </div>
                            </div>
                        ))}

                        <Pagination page={services.page} pages={services.pages} setPage={setServicePage} />
                    </>
                )}
            </section>

            <section className="admin-section">
                <h2>Пользователи</h2>

                <input
                    className="input search-input"
                    placeholder="Поиск по имени или email..."
                    value={userSearch}
                    onChange={e => {
                        setUserSearch(e.target.value);
                        setUserPage(1);
                    }}
                />

                <p>Найдено пользователей: {users.total}</p>

                {loading ? (
                    <div>Загрузка...</div>
                ) : users.items.length === 0 ? (
                    <div>Пользователи не найдены</div>
                ) : (
                    <>
                        {users.items.map(item => (
                            <div className="admin-item" key={item.id_user}>
                                <h3>{item.first_name} {item.last_name}</h3>
                                <p>Email: {item.email}</p>
                                <p>Телефон: {item.phone || 'не указан'}</p>

                                {item.discount_percent > 0 && (
                                    <p className="discount">Текущая скидка: {item.discount_percent}%</p>
                                )}

                                <div className="admin-inline">
                                    <input
                                        className="input medium-input"
                                        placeholder="Промокод"
                                        defaultValue={item.coupon_code || ''}
                                        id={`coupon-${item.id_user}`}
                                    />
                                    <input
                                        className="input small-input"
                                        type="number"
                                        min="0"
                                        max="100"
                                        defaultValue={item.discount_percent || 0}
                                        id={`discount-${item.id_user}`}
                                    />
                                    <button
                                        className="button"
                                        onClick={() => saveUserDiscount(
                                            item.id_user,
                                            document.getElementById(`coupon-${item.id_user}`).value,
                                            document.getElementById(`discount-${item.id_user}`).value
                                        )}
                                    >
                                        Сохранить
                                    </button>
                                </div>
                            </div>
                        ))}

                        <Pagination page={users.page} pages={users.pages} setPage={setUserPage} />
                    </>
                )}
            </section>
        </div>
    );
}

export default AdminPanel;