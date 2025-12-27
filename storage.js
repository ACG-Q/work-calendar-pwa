class TaskStorage {
    constructor(storageKey) {
        this.storageKey = storageKey;
    }

    load() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('加载数据失败:', error);
            return [];
        }
    }

    save(tasks) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(tasks));
            return true;
        } catch (error) {
            console.error('保存数据失败:', error);
            return false;
        }
    }
}

const taskStorage = new TaskStorage(Constants.STORAGE_KEY);
