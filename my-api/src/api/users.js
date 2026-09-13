const API_URL = 'http://localhost:5000/api/users';

async function checkResponse(response, message) {
    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error || data.details || message
        );
    }

    return data;
}

function handleError(error) {
    if (error instanceof TypeError) {
        throw new Error(
            'Не удалось подключиться к серверу',
            { cause: error }
        );
    }

    throw error;
}

export async function getUsers() {
    try {
        const response = await fetch(API_URL);

        return await checkResponse(
            response,
            'Не удалось загрузить пользователей'
        );
    } catch (error) {
        handleError(error);
    }
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

    try {
        const response = await fetch(
            `${API_URL}?${params}`
        );

        return await checkResponse(
            response,
            'Не удалось загрузить пользователей'
        );
    } catch (error) {
        handleError(error);
    }
}

export async function updateUserDiscount(
    userId,
    couponCode,
    discountPercent
) {
    try {
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

        return await checkResponse(
            response,
            'Не удалось изменить скидку пользователя'
        );
    } catch (error) {
        handleError(error);
    }
}