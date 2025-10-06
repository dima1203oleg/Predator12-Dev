/**
 * API методи для роботи з налаштуваннями сповіщень
 */

import axios from 'axios';

/**
 * Базова URL адреса API
 */
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/**
 * Отримати налаштування сповіщень для поточного користувача
 * @returns {Promise<Object>} Об'єкт налаштувань сповіщень
 */
export const getNotificationPreferences = async () => {
  try {
    const token = localStorage.getItem('auth_token');
    const response = await axios.get(`${API_URL}/api/notification-preferences/`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    throw error;
  }
};

/**
 * Оновити налаштування сповіщень
 * @param {Object} preferences Об'єкт з налаштуваннями
 * @returns {Promise<Object>} Оновлений об'єкт налаштувань
 */
export const updateNotificationPreferences = async (preferences) => {
  try {
    const token = localStorage.getItem('auth_token');
    const response = await axios.post(`${API_URL}/api/notification-preferences/`, preferences, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    throw error;
  }
};

/**
 * Скинути налаштування сповіщень до стандартних
 * @returns {Promise<void>}
 */
export const resetNotificationPreferences = async () => {
  try {
    const token = localStorage.getItem('auth_token');
    await axios.delete(`${API_URL}/api/notification-preferences/`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  } catch (error) {
    console.error('Error resetting notification preferences:', error);
    throw error;
  }
}; 