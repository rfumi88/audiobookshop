import { useCallback, useContext, useEffect, useState } from 'react';
import { getServices } from '../api/services';
import { getCategories } from '../api/categories';
import { addToCart } from '../api/cart';
import { AuthContext } from './AuthContext';

const images = { 1: '/public/master.jpg', 2: '/public/crime.jpg', 3: '/public/harry.jpg', 4: '/public/hobbit.jpg', 5: '/public/sherlock.jpg', 6: '/public/1984.jpg', 7: '/public/three-comrades.jpg', 8: '/public/it.jpg', 9: '/public/little-prince.jpg', 10: '/public/three-musketeers.jpg' };

function ServicesList() {
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useContext(AuthContext);
    const userId = user?.id_user;
    const loadServices = useCallback(() => {
        setLoading(true);
        setError('');

        getServices()
            .then(data => setServices(data))
            .catch(error => {
                console.error('Ошибка загрузки аудиокниг:', error);
                setError(error.message || 'Ошибка загрузки аудиокниг');
            })
            .finally(() => setLoading(false));
    }, []);

    const loadCategories = useCallback(() => {
        getCategories()
            .then(data => setCategories(data))
            .catch(error => {
                console.error('Ошибка загрузки категорий:', error);
                setError(error.message || 'Ошибка загрузки категорий');
            });
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            loadServices();
            loadCategories();
        }, 0);

        return () => clearTimeout(timer);
    }, [loadServices, loadCategories]);

    useEffect(() => {
        const updateCategories = () => loadCategories();

        window.addEventListener('categoriesUpdated', updateCategories);

        return () => window.removeEventListener('categoriesUpdated', updateCategories);
    }, [loadCategories]);

    const handleAddToCart = serviceId => {
        if (!userId) {
            alert('Сначала войдите в аккаунт');
            return;
        }

        addToCart(userId, serviceId, 1)
            .then(() => {
                window.dispatchEvent(new Event('cartUpdated'));
                alert('Аудиокнига добавлена в корзину');
            })
            .catch(error => {
                console.error('Ошибка добавления в корзину:', error);
                alert(error.message || 'Ошибка добавления в корзину');
            });
    };

    const handleCategoryChange = categoryId => {
        setSelectedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    if (loading) {
        return (
            <div className="page">
                <h2>Каталог аудиокниг</h2>
                <p>Загрузка аудиокниг...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page">
                <p className="error">{error}</p>
                <button onClick={loadServices} className="button">Попробовать снова</button>
            </div>
        );
    }

    const filteredServices = selectedCategories.length === 0 ? services : services.filter(service => selectedCategories.includes(service.id_category));

    return (
        <div className="page">
            <div className="catalog-layout">
                <aside className="categories">
                    <h3>Категории</h3>

                    {categories.length === 0 ? (
                        <p>Категорий пока нет.</p>
                    ) : (
                        categories.map(category => (
                            <label key={category.id_category} className="category-label">
                                <input
                                    type="checkbox"
                                    checked={selectedCategories.includes(category.id_category)}
                                    onChange={() => handleCategoryChange(category.id_category)}
                                />
                                <span>{category.category_name}</span>
                            </label>
                        ))
                    )}
                </aside>

                <main className="catalog">
                    <h2>Каталог аудиокниг</h2>

                    {filteredServices.length === 0 ? (
                        <p>По выбранным категориям аудиокниг нет.</p>
                    ) : (
                        filteredServices.map(service => {
                            const price = Number(service.price) || 0;
                            const discount = Number(service.discount_percent) || 0;
                            const priceAfterDiscount = price * (1 - discount / 100);

                            return (
                                <div key={service.id_service} className="service-card">
                                    <img src={images[service.id_service]} alt={service.service_name} className="service-image" />

                                    <h3>{service.service_name}</h3>
                                    <p><strong>Автор:</strong> {service.author}</p>
                                    <p><strong>Описание:</strong> {service.description}</p>
                                    <p><strong>Категория:</strong> {service.category_name}</p>
                                    <p><strong>Длительность:</strong> {service.duration?.hours} ч {service.duration?.minutes} мин</p>
                                    <p><strong>Цена:</strong> {price.toFixed(2)} ₽</p>

                                    {discount > 0 && (
                                        <>
                                            <p className="discount"><strong>Скидка:</strong> {discount.toFixed(0)}%</p>
                                            <p><strong>Цена со скидкой:</strong> {priceAfterDiscount.toFixed(2)} ₽</p>
                                        </>
                                    )}

                                    <button onClick={() => handleAddToCart(service.id_service)} className="button">
                                        Добавить в корзину
                                    </button>
                                </div>
                            );
                        })
                    )}
                </main>
            </div>
        </div>
    );
}

export default ServicesList;
