class CustomDialog {
    constructor() {
        this.confirmResolve = null;
        this.listenersSetup = false;
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        if (this.listenersSetup) {
            return;
        }
        
        const cancelBtn = document.getElementById('confirmCancel');
        const okBtn = document.getElementById('confirmOk');
        const confirmModal = document.getElementById('confirmModal');
        
        console.log('CustomDialog setupEventListeners:', {
            cancelBtn: !!cancelBtn,
            okBtn: !!okBtn,
            confirmModal: !!confirmModal,
            cancelBtnId: cancelBtn?.id,
            okBtnId: okBtn?.id
        });
        
        if (!cancelBtn || !okBtn || !confirmModal) {
            console.warn('确认弹窗元素未找到，将使用原生对话框');
            return;
        }
        
        this.listenersSetup = true;
        
        cancelBtn.addEventListener('click', () => {
            console.log('cancelBtn clicked, confirmResolve:', !!this.confirmResolve);
            if (this.confirmResolve) {
                this.confirmResolve(false);
                console.log('cancelBtn: resolved with false');
            }
            this.hideConfirmModal();
        });
        
        okBtn.addEventListener('click', () => {
            console.log('okBtn clicked, confirmResolve:', !!this.confirmResolve);
            if (this.confirmResolve) {
                this.confirmResolve(true);
                console.log('okBtn: resolved with true');
            }
            this.hideConfirmModal();
        });
        
        confirmModal.addEventListener('click', (e) => {
            if (e.target === confirmModal) {
                console.log('confirmModal background clicked');
                if (this.confirmResolve) {
                    this.confirmResolve(false);
                }
                this.hideConfirmModal();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (!confirmModal.classList.contains('hidden')) {
                    console.log('Escape key pressed');
                    if (this.confirmResolve) {
                        this.confirmResolve(false);
                    }
                    this.hideConfirmModal();
                }
            }
        });
    }
    
    // ============ 主要方法 ============
    
    /**
     * 显示确认对话框
     * @param {string} title - 对话框标题
     * @param {string} message - 对话框消息
     * @param {Object} options - 选项
     * @param {string} options.okText - 确定按钮文本
     * @param {string} options.cancelText - 取消按钮文本
     * @returns {Promise<boolean>} - true:用户点击确定, false:用户点击取消或关闭
     */
    showConfirm(title = '确认操作', message = '确定要执行此操作吗？', options = {}) {
        let that = this
        return new Promise((resolve) => {
            const titleElement = document.getElementById('confirmTitle');
            const messageElement = document.getElementById('confirmMessage');
            const okBtn = document.getElementById('confirmOk');
            const cancelBtn = document.getElementById('confirmCancel');
            const modal = document.getElementById('confirmModal');
            
            if (!titleElement || !messageElement || !okBtn || !cancelBtn || !modal) {
                console.warn('弹窗元素未找到，使用原生 confirm');
                const result = window.confirm(`${title}\n\n${message}`);
                resolve(result);
                return;
            }
            
            that.confirmResolve = resolve;
            
            // 设置内容
            titleElement.textContent = title;
            messageElement.textContent = message;
            
            // 设置按钮文本（如果提供了）
            if (options.okText) okBtn.textContent = options.okText;
            if (options.cancelText) cancelBtn.textContent = options.cancelText;
            
            // 显示弹窗
            modal.classList.remove('hidden');
        });
    }
    
    /**
     * 显示警告对话框
     * @param {string} message - 警告消息
     * @param {string} title - 对话框标题，默认为"警告"
     * @returns {Promise<boolean>} - true:用户点击确定
     */
    async showWarning(message, title = '警告') {
        return await this.showConfirm(title, message, {
            okText: '我知道了',
            cancelText: '取消'
        });
    }
    
    /**
     * 显示错误对话框
     * @param {string} message - 错误消息
     * @param {string} title - 对话框标题，默认为"错误"
     * @returns {Promise<boolean>} - true:用户点击确定
     */
    async showError(message, title = '错误') {
        return await this.showConfirm(title, message, {
            okText: '确定',
            cancelText: null // 错误对话框通常只有一个确定按钮
        });
    }
    
    /**
     * 显示信息提示（单按钮）
     * @param {string} message - 提示消息
     * @param {string} title - 对话框标题，默认为"提示"
     * @returns {Promise<boolean>} - 总是返回true
     */
    async showInfo(message, title = '提示') {
        return await this.showConfirm(title, message, {
            okText: '我知道了',
            cancelText: null // 隐藏取消按钮
        });
    }
    
    /**
     * 显示成功提示
     * @param {string} message - 成功消息
     * @param {number} autoCloseDelay - 自动关闭延迟（毫秒），0表示不自动关闭
     */
    showSuccess(message = '操作已成功完成', autoCloseDelay = 3000) {
        const messageElement = document.getElementById('successMessage');
        const modal = document.getElementById('successModal');
        
        if (!messageElement || !modal) {
            console.log('成功提示:', message);
            return;
        }
        
        messageElement.textContent = message;
        modal.classList.remove('hidden');
        
        // 设置自动关闭
        if (autoCloseDelay > 0) {
            setTimeout(() => {
                this.hideSuccessModal();
            }, autoCloseDelay);
        }
    }
    
    // ============ 工具方法 ============
    
    hideConfirmModal() {
        const modal = document.getElementById('confirmModal');
        if (modal) {
            modal.classList.add('hidden');
        }
        this.confirmResolve = null;
    }
    
    hideSuccessModal() {
        const modal = document.getElementById('successModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }
    
    // ============ 便捷方法 ============
    
    /**
     * 显示删除确认对话框
     * @param {string} itemName - 要删除的项目名称（可选）
     * @returns {Promise<boolean>} - true:确认删除
     */
    async showDeleteConfirm(itemName = '') {
        const message = itemName 
            ? `确定要删除"${itemName}"吗？此操作不可撤销。`
            : '确定要删除这个项目吗？此操作不可撤销。';
        
        return await this.showConfirm('删除确认', message, {
            okText: '删除',
            cancelText: '取消'
        });
    }
    
    /**
     * 显示保存确认对话框
     * @returns {Promise<boolean>} - true:确认保存
     */
    async showSaveConfirm() {
        return await this.showConfirm('保存确认', '确定要保存修改吗？', {
            okText: '保存',
            cancelText: '不保存'
        });
    }
}