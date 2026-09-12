import { useCallback, useContext, useEffect, useState } from 'react';
import { getCart, updateCartItem, removeFromCart } from '../api/cart';
import { createOrder } from '../api/appointments';
import { AuthContext } from './AuthContext';

function Cart() {
    const { user } = useContext(AuthContext);
    const userId = user?.id_user;

    const [cart, setCart] = useState({
        items: [],
        subtotal: 0,
        userDiscountPercent: 0,
        userDiscountAmount: 0,
        couponCode: null,
        total: 0
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [orderLoading, setOrderLoading] = useState(false);
    const [orderMessage, setOrderMessage] = useState('');

    const loadCart = useCallback(() => {
        if (!userId) {
            setLoading(false);
            return Promise.resolve();
        }

        setLoading(true);
        setError('');

        return getCart(userId)
            .then(data => {
                setCart({
                    items: data.items || [],
                    subtotal: Number(data.subtotal) || 0,
                    userDiscountPercent: Number(data.userDiscountPercent) || 0,
                    userDiscountAmount: Number(data.userDiscountAmount) || 0,
                    couponCode: data.couponCode || null,
                    total: Number(data.total) || 0
                });
            })
            .catch(error => {
                console.error('Ошибка загрузки корзины:', error);
                setError(error.message || 'Ошибка загрузки корзины');
            })
            .finally(() => setLoading(false));
    }, [userId]);

    useEffect(() => {
        const timer = setTimeout(loadCart, 0);
        window.addEventListener('cartUpdated', loadCart);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('cartUpdated', loadCart);
        };
    }, [loadCart]);

    const handleIncrease = item => {
        setError('');

        updateCartItem(item.id_cart_item, Number(item.quantity) + 1)
            .then(loadCart)
            .catch(error => {
                console.error('Ошибка увеличения количества:', error);
                setError(error.message || 'Ошибка изменения количества');
            });
    };

    const handleDecrease = item => {
        setError('');

        const quantity = Number(item.quantity);

        const request = quantity === 1
            ? removeFromCart(item.id_cart_item)
            : updateCartItem(item.id_cart_item, quantity - 1);

        request
            .then(loadCart)
            .catch(error => {
                console.error('Ошибка уменьшения количества:', error);
                setError(error.message || 'Ошибка изменения количества');
            });
    };

    const handleRemove = itemId => {
        setError('');

        removeFromCart(itemId)
            .then(loadCart)
            .catch(error => {
                console.error('Ошибка удаления товара:', error);
                setError(error.message || 'Ошибка удаления товара');
            });
    };

    const handleCreateOrder = () => {
        if (!window.confirm('Оформить заказ?')) return;

        setOrderLoading(true);
        setOrderMessage('');
        setError('');

        createOrder(userId)
            .then(data => {
                setOrderMessage(data.message || 'Заказ успешно оформлен');
                return loadCart();
            })
            .then(() => {
                window.dispatchEvent(new Event('cartUpdated'));
            })
            .catch(error => {
                console.error('Ошибка оформления заказа:', error);
                setError(error.message || 'Ошибка оформления заказа');
            })
            .finally(() => setOrderLoading(false));
    };

    if (!userId) {
        return (
            <div className="page">
                <h2>Корзина</h2>
                <p>Сначала войдите в аккаунт, чтобы посмотреть корзину.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="page">
                <h2>Корзина</h2>
                <p>Загрузка корзины...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page">
                <h2>Корзина</h2>
                <p className="error">{error}</p>
                <button onClick={loadCart} className="button">Попробовать снова</button>
            </div>
        );
    }

    return (
        <div className="page">
            <h2>Корзина</h2>

            {cart.items.length === 0 ? (
                <>
                    <p>Корзина пуста</p>
                    {orderMessage && <p className="success">{orderMessage}</p>}
                </>
            ) : (
                <>
                    {cart.items.map(item => {
                        const price = Number(item.price) || 0;
                        const discount = Number(item.discount_percent) || 0;
                        const quantity = Number(item.quantity) || 1;
                        const priceAfterDiscount = price * (1 - discount / 100);
                        const itemTotal = priceAfterDiscount * quantity;

                        return (
                            <div key={item.id_cart_item} className="card">
                                <h3>{item.service_name}</h3>
                                <p><strong>Автор:</strong> {item.author}</p>
                                <p><strong>Цена:</strong> {price.toFixed(2)} ₽</p>

                                {discount > 0 && (
                                    <p className="discount"><strong>Скидка:</strong> {discount}%</p>
                                )}

                                <p><strong>Цена со скидкой:</strong> {priceAfterDiscount.toFixed(2)} ₽</p>

                                <div className="quantity">
                                    <strong>Количество:</strong>
                                    <button onClick={() => handleDecrease(item)} className="quantity-button">−</button>
                                    <span>{quantity}</span>
                                    <button onClick={() => handleIncrease(item)} className="quantity-button">+</button>
                                </div>

                                <p><strong>Сумма:</strong> {itemTotal.toFixed(2)} ₽</p>

                                <button onClick={() => handleRemove(item.id_cart_item)} className="button">
                                    Удалить
                                </button>
                            </div>
                        );
                    })}

                    <div className="order-summary">
                        <h3>Расчёт заказа</h3>
                        <p><strong>Сумма товаров:</strong> {cart.subtotal.toFixed(2)} ₽</p>

                        {cart.userDiscountPercent > 0 && (
                            <>
                                <p className="discount"><strong>Персональная скидка:</strong> {cart.userDiscountPercent.toFixed(0)}%</p>

                                {cart.couponCode && (
                                    <p className="discount"><strong>Купон:</strong> {cart.couponCode}</p>
                                )}

                                <p className="discount"><strong>Сумма скидки:</strong> -{cart.userDiscountAmount.toFixed(2)} ₽</p>
                            </>
                        )}

                        <h3>Итого: {cart.total.toFixed(2)} ₽</h3>

                        {orderMessage && (
                            <p className="success">{orderMessage}</p>
                        )}

                        <button onClick={handleCreateOrder} disabled={orderLoading} className="button order-button">
                            {orderLoading ? 'Оформление...' : 'Оформить заказ'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default Cart;