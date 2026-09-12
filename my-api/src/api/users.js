const API_URL = 'http://localhost:5000/api/users';

function checkResponse(response, message) {
    return response.json().then((data) => {
        if (!response.ok) {
            throw new Error(
                data.error || data.details || message
            );
        }

        return data;
    });
}

function handleError(error) {
    if (error instanceof TypeError) {
        throw new Error('Не удалось подключиться к серверу');
    }

    throw error;
}

export function getUsers() {
    return fetch(API_URL)
        .then((response) =>
            checkResponse(
                response,
                'Не удалось загрузить пользователей'
            )
        )
        .catch(handleError);
}

export function getAdminUsers(search = '',page = 1,limit = 5) {
    const params = new URLSearchParams({
        search,
        page,
        limit
    });

    return fetch(`${API_URL}?${params}`)
        .then((response) =>
            checkResponse(
                response,
                'Не удалось загрузить пользователей'
            )
        )
        .catch(handleError);
}

export function updateUserDiscount(userId,couponCode,discountPercent) {
    return fetch(`${API_URL}/${userId}/discount`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            coupon_code: couponCode,
            discount_percent: discountPercent
        })
    })
        .then((response) =>
            checkResponse(
                response,
                'Не удалось изменить скидку пользователя'
            )
        )
        .catch(handleError);
}