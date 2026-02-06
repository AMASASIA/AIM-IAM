import { ref } from 'vue';

const notifications = ref([]);

export const useNotifications = () => {
    const notify = (title, message, type = 'info', actions = null) => {
        const id = Date.now().toString();
        notifications.value.push({
            id,
            title,
            message,
            type,
            actions,
            timestamp: Date.now()
        });

        // Auto remove after 5 seconds only if no actions (interactive needs time)
        if (!actions) {
            setTimeout(() => {
                removeNotification(id);
            }, 5000);
        }
    };

    const removeNotification = (id) => {
        notifications.value = notifications.value.filter(n => n.id !== id);
    };

    return {
        notifications,
        notify,
        removeNotification
    };
};
