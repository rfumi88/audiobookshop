const API_URL = 'http://localhost:5000/api/categories';

function checkResponse(response, message) {
    return response.json().then((data) => {
        if (!response.ok) {
            throw new Error(data.error || data.details || message);
        }
        return data;
    });
}

export function getCategories() {
    return fetch(API_URL)
        .then((response) =>
            checkResponse(
                response,
                'Не удалось загрузить категории'
            )
        )
        .catch((error) => {
            if (error instanceof TypeError) {
                throw new Error(
                    'Не удалось подключиться к серверу'
                );
            }
            throw error;
        });
}

export function createCategory(category) {
    return fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(category)
    })
        .then((response) =>
            checkResponse(
                response,
                'Не удалось добавить категорию'
            )
        )
        .catch((error) => {
            if (error instanceof TypeError) {
                throw new Error(
                    'Не удалось подключиться к серверу'
                );
            }
            throw error;
        });
}

export function deleteCategory(categoryId) {
    return fetch(`${API_URL}/${categoryId}`, {
        method: 'DELETE'
    })
        .then((response) =>
            checkResponse(
                response,
                'Не удалось удалить категорию'
            )
        )
        .catch((error) => {
            if (error instanceof TypeError) {
                throw new Error(
                    'Не удалось подключиться к серверу'
                );
            }
            throw error;
        });
}