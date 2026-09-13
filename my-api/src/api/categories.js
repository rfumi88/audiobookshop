const API_URL = 'http://localhost:5000/api/categories';

async function checkResponse(response, message) {
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || data.details || message);
    }

    return data;
}

export async function getCategories() {
    try {
        const response = await fetch(API_URL);

        return await checkResponse(
            response,
            'Не удалось загрузить категории'
        );
    } catch (error) {
        if (error instanceof TypeError) {
            throw new Error(
                'Не удалось подключиться к серверу',
                { cause: error }
            );
        }

        throw error;
    }
}

export async function createCategory(category) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(category)
        });

        return await checkResponse(
            response,
            'Не удалось добавить категорию'
        );
    } catch (error) {
        if (error instanceof TypeError) {
            throw new Error(
                'Не удалось подключиться к серверу',
                { cause: error }
            );
        }

        throw error;
    }
}

export async function deleteCategory(categoryId) {
    try {
        const response = await fetch(`${API_URL}/${categoryId}`, {
            method: 'DELETE'
        });

        return await checkResponse(
            response,
            'Не удалось удалить категорию'
        );
    } catch (error) {
        if (error instanceof TypeError) {
            throw new Error(
                'Не удалось подключиться к серверу',
                { cause: error }
            );
        }

        throw error;
    }
}