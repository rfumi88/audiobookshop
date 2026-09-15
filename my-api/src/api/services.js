const API_URL = 'http://localhost:5000/api/services';

export async function getServices() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error('Ошибка при получении аудиокниг');
        }

        return await response.json();
    } catch {
        throw new Error('Не удалось подключиться к серверу');
    }
}

export async function getAdminServices(
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
        throw new Error('Ошибка при получении аудиокниг');
    }

    return await response.json();
}

export async function updateServiceDiscount(
    serviceId,
    discountPercent
) {
    const response = await fetch(
        `${API_URL}/${serviceId}/discount`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                discount_percent: discountPercent
            })
        }
    );

    if (!response.ok) {
        throw new Error('Ошибка при изменении скидки');
    }

    return await response.json();
}