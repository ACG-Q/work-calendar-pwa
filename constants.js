const Constants = {
    MONTH_NAMES: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    DAY_NAMES: ['日', '一', '二', '三', '四', '五', '六'],
    STORAGE_KEY: 'smartCalendarTasks',
    PRIORITY_COLORS: {
        high: 'bg-danger',
        medium: 'bg-warning',
        low: 'bg-success'
    },
    PRIORITY_BORDER: {
        high: 'border-l-danger',
        medium: 'border-l-warning',
        low: 'border-l-success'
    },
    PRIORITY_LABELS: {
        high: '高优先级',
        medium: '中优先级',
        low: '低优先级'
    },
    VALIDATION_LIMITS: {
        TITLE_MAX_LENGTH: 100,
        DESCRIPTION_MAX_LENGTH: 500
    },
    STATUS_TYPES: {
        ONLINE: 'online',
        OFFLINE: 'offline'
    },
    FILTER_TYPES: {
        ALL: 'all',
        HIGH: 'high',
        MEDIUM: 'medium',
        LOW: 'low'
    },
    MODAL_IDS: {
        TASK: 'taskModal',
        DATA: 'dataModal',
        CONFIRM: 'confirmModal',
        SUCCESS: 'successModal'
    },
    DEFAULT_TIME: '09:00',
    CALENDAR_CELLS: 42
};
