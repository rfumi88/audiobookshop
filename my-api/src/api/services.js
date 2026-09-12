const API_URL = 'http://localhost:5000/api/services';

function checkResponse(response, message) {
    return response.json().then((data) => {
        if (!response.ok) {
            throw new Error(data.error || data.details || message);
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

export function getServices() {
    return fetch(API_URL)
        .then((response) =>
            checkResponse(
                response,
                'Не удалось загрузить аудиокниги'
            )
        )
        .catch(handleError);
}

export function getAdminServices(search = '', page = 1, limit = 5) {
    const params = new URLSearchParams({
        search,
        page,
        limit
    });

    return fetch(`${API_URL}?${params}`)
        .then((response) =>
            checkResponse(
                response,
                'Не удалось загрузить аудиокниги'
            )
        )
        .catch(handleError);
}


export function updateServiceDiscount(serviceId,discountPercent) {
    return fetch(`${API_URL}/${serviceId}/discount`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            discount_percent: discountPercent
        })
    })
        .then((response) =>
            checkResponse(
                response,
                'Не удалось изменить скидку'
            )
        )
        .catch(handleError);
}