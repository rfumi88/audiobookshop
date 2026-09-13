const API_URL = 'http://localhost:5000/api/users';

export async function getUsers() {
    const response = await fetch(API_URL);

    if (!response.ok) {
        throw new Error(
            'Ошибка при получении пользователей'
        );
    }

    return await response.json();
}

export async function getAdminUsers(
    search = '',
    page = 1,
    limit = 5
) {
    const params = new URLSearchParams({
        search,
        page,
        limit
    });

    const response = await fetch(
        `${API_URL}?${params}`
    );

    if (!response.ok) {
        throw new Error(
            'Ошибка при получении пользователей'
        );
    }

    return await response.json();
}

export async function updateUserDiscount(
    userId,
    couponCode,
    discountPercent
) {
    const response = await fetch(
        `${API_URL}/${userId}/discount`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                coupon_code: couponCode,
                discount_percent: discountPercent
            })
        }
    );

    if (!response.ok) {
        throw new Error(
            'Ошибка при изменении скидки пользователя'
        );
    }

    return await response.json();
}