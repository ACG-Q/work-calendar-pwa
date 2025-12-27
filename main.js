const App = {
    currentDate: new Date(),
    tasks: [],
    editingTaskId: null,
    currentFilter: 'all',
    deferredPrompt: null,
    customDialog: null,

    init() {
        this.loadTasks();
        this.renderCalendar();
        this.renderTasksList();
        this.updateFilterButtons();

        const today = new Date();
        document.getElementById('taskDate').value = today.toISOString().split('T')[0];
        document.getElementById('taskTime').value = '09:00';

        this.customDialog = new CustomDialog();

        if (navigator.onLine) {
            setTimeout(() => this.showStatus('🌐 在线', 'online'), 500);
        }
    },

    loadTasks() {
        this.tasks = taskStorage.load();
    },

    saveTasks() {
        taskStorage.save(this.tasks);
        this.showStatus('💾 数据已保存', 'online');
    },

    formatLocalDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        document.getElementById('currentMonthYear').textContent =
            `${year}年 ${Constants.MONTH_NAMES[month]}`;

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const prevLastDay = new Date(year, month, 0);

        const startDay = firstDay.getDay();
        let html = '';

        for (let i = startDay - 1; i >= 0; i--) {
            const day = prevLastDay.getDate() - i;
            const date = new Date(year, month - 1, day);
            html += this.createDayCell(date, false);
        }

        for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(year, month, day);
            html += this.createDayCell(date, true);
        }

        const totalCells = startDay + lastDay.getDate();
        const remaining = 42 - totalCells;

        for (let day = 1; day <= remaining; day++) {
            const date = new Date(year, month + 1, day);
            html += this.createDayCell(date, false);
        }

        document.getElementById('calendar').innerHTML = html;
    },

    createDayCell(date, isCurrentMonth) {
        const today = new Date();
        const isToday = date.toDateString() === today.toDateString();
        const dateStr = this.formatLocalDate(date);

        const dayTasks = this.tasks.filter(t => t.date === dateStr);

        let dotsHtml = '';
        if (dayTasks.length > 0) {
            dotsHtml = '<div class="flex justify-center gap-1 flex-wrap mt-1">';
            dayTasks.slice(0, 3).forEach(task => {
                const colorClass = Constants.PRIORITY_COLORS[task.priority] || 'bg-primary';
                dotsHtml += `<span class="task-dot w-2 h-2 rounded-full ${colorClass} animate-dot-pulse"></span>`;
            });
            dotsHtml += '</div>';
        }

        const cellClass = [
            'aspect-square',
            'rounded-xl',
            'p-2',
            'md:p-3',
            'cursor-pointer',
            'transition-all',
            'duration-300',
            'flex',
            'flex-col',
            'items-center',
            'justify-start',
            'border-2',
            isToday ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-transparent shadow-lg' : 'border-white/30 bg-white/40',
            !isCurrentMonth ? 'opacity-30' : '',
            dayTasks.length > 0 ? 'hover:border-primary/50' : 'hover:border-primary'
        ].join(' ');

        return `
            <div class="${cellClass}" onclick="App.openTaskModal('${dateStr}')">
                <div class="font-bold text-sm md:text-base mb-1">${date.getDate()}</div>
                ${dotsHtml}
            </div>
        `;
    },

    renderTasksList() {
        const filtered = this.currentFilter === 'all'
            ? this.tasks
            : this.tasks.filter(t => t.priority === this.currentFilter);

        const sorted = filtered.sort((a, b) => {
            const dateA = new Date(a.date + 'T' + a.time);
            const dateB = new Date(b.date + 'T' + b.time);
            return dateA - dateB;
        });

        if (sorted.length === 0) {
            document.getElementById('tasksList').innerHTML = `
                <div class="text-center py-12">
                    <div class="text-6xl mb-4 animate-float">📭</div>
                    <p class="text-gray-600">暂无任务</p>
                </div>
            `;
            return;
        }

        const html = sorted.map(task => {
            const borderColor = Constants.PRIORITY_BORDER[task.priority] || 'border-l-primary';

            return `
                <div class="${borderColor} border-l-4 rounded-xl p-4 bg-white/50 backdrop-blur-sm transition hover:translate-x-2 hover:shadow-lg animate-fade-in">
                    <div class="flex justify-between items-start gap-3">
                        <div class="flex-1">
                            <div class="font-bold text-gray-800 text-base mb-2">${task.title}</div>
                            <div class="flex items-center gap-3 text-sm text-gray-600 mb-2">
                                <span class="flex items-center gap-1">
                                    <span>📅</span>
                                    <span>${task.date}</span>
                                </span>
                                <span class="flex items-center gap-1">
                                    <span>⏰</span>
                                    <span>${task.time}</span>
                                </span>
                            </div>
                            ${task.description ? `
                                <div class="text-sm text-gray-500 mt-2">
                                    ${task.description}
                                </div>
                            ` : ''}
                        </div>
                        <div class="flex gap-2">
                            <button onclick="App.editTask('${task.id}')" class="w-8 h-8 rounded-lg bg-white/70 flex items-center justify-center text-primary transition hover:bg-primary hover:text-white">
                                ✏️
                            </button>
                            <button onclick="App.deleteTask('${task.id}')" class="w-8 h-8 rounded-lg bg-white/70 flex items-center justify-center text-danger transition hover:bg-danger hover:text-white">
                                🗑️
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        document.getElementById('tasksList').innerHTML = html;
    },

    openTaskModal(date = '') {
        this.editingTaskId = null;
        document.getElementById('modalTitle').textContent = '新建任务';
        document.getElementById('taskTitle').value = '';
        document.getElementById('taskDate').value = date || new Date().toISOString().split('T')[0];
        document.getElementById('taskTime').value = '09:00';
        document.getElementById('taskPriority').value = 'medium';
        document.getElementById('taskDescription').value = '';
        document.getElementById('taskModal').classList.remove('hidden');
    },

    closeTaskModal() {
        document.getElementById('taskModal').classList.add('hidden');
        this.editingTaskId = null;
    },

    editTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return;

        this.editingTaskId = id;
        document.getElementById('modalTitle').textContent = '编辑任务';
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDate').value = task.date;
        document.getElementById('taskTime').value = task.time;
        document.getElementById('taskPriority').value = task.priority;
        document.getElementById('taskDescription').value = task.description || '';
        document.getElementById('taskModal').classList.remove('hidden');
    },

    async saveTask() {
        const title = document.getElementById('taskTitle').value.trim();
        const date = document.getElementById('taskDate').value;
        const time = document.getElementById('taskTime').value;
        const priority = document.getElementById('taskPriority').value;
        const description = document.getElementById('taskDescription').value.trim();

        const validation = Validators.validateTaskData({ title, date, time, description });
        if (!validation.isValid) {
            if (validation.errors.title) {
                await this.customDialog.showError(validation.errors.title);
                document.getElementById('taskTitle').focus();
                return;
            }
            if (validation.errors.date) {
                await this.customDialog.showError(validation.errors.date);
                document.getElementById('taskDate').focus();
                return;
            }
            if (validation.errors.time) {
                await this.customDialog.showError(validation.errors.time);
                document.getElementById('taskTime').focus();
                return;
            }
            if (validation.errors.description) {
                await this.customDialog.showError(validation.errors.description);
                document.getElementById('taskDescription').focus();
                return;
            }
        }

        const selectedDateTime = new Date(`${date}T${time}`);
        const now = new Date();
        if (selectedDateTime < now && !this.editingTaskId) {
            const confirmed = await this.customDialog.showConfirm(
                '时间提醒',
                '您选择的时间已经过去，确定要创建这个任务吗？',
                {
                    okText: '仍然创建',
                    cancelText: '重新选择'
                }
            );

            if (!confirmed) {
                return;
            }
        }

        try {
            const taskData = {
                title,
                date,
                time,
                priority,
                description,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            if (this.editingTaskId) {
                const index = this.tasks.findIndex(t => t.id === this.editingTaskId);
                if (index !== -1) {
                    const originalTask = this.tasks[index];
                    this.tasks[index] = {
                        ...taskData,
                        id: this.editingTaskId,
                        createdAt: originalTask.createdAt || new Date().toISOString()
                    };
                }

                this.saveTasks();
                this.renderCalendar();
                this.renderTasksList();
                this.closeTaskModal();
                this.customDialog.showSuccess('任务更新成功');

            } else {
                const newTask = {
                    ...taskData,
                    id: Date.now().toString()
                };

                this.tasks.push(newTask);
                this.saveTasks();
                this.renderCalendar();
                this.renderTasksList();
                this.closeTaskModal();
                this.customDialog.showSuccess('任务创建成功');
            }

        } catch (error) {
            console.error('保存任务时出错:', error);
            await this.customDialog.showError('保存失败，请重试');
        }
    },

    async deleteTask(id) {
        const task = this.tasks.find(t => t.id === id);
        const taskName = task ? task.title : '任务';

        const confirmed = await this.customDialog.showDeleteConfirm(taskName);

        if (confirmed) {
            this.tasks = this.tasks.filter(t => t.id !== id);
            this.saveTasks();
            this.renderCalendar();
            this.renderTasksList();
            this.customDialog.showSuccess(`${taskName} 已成功删除`);
        }
    },

    filterTasks(priority) {
        this.currentFilter = priority;
        this.updateFilterButtons();
        this.renderTasksList();
    },

    updateFilterButtons() {
        const buttons = document.querySelectorAll('.filter-btn');
        buttons.forEach(button => {
            const buttonPriority = button.getAttribute('data-filter');
            if (buttonPriority === this.currentFilter) {
                button.classList.add('bg-gradient-to-br', 'from-indigo-500', 'to-purple-600', 'text-white', 'border-transparent');
                button.classList.remove('border-white/30', 'bg-white/30');
            } else {
                button.classList.remove('bg-gradient-to-br', 'from-indigo-500', 'to-purple-600', 'text-white', 'border-transparent');
                button.classList.add('border-white/30', 'bg-white/30');
            }
        });
    },

    previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.renderCalendar();
    },

    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.renderCalendar();
    },

    goToToday() {
        this.currentDate = new Date();
        this.renderCalendar();
    },

    openDataPanel() {
        document.getElementById('taskCount').textContent = this.tasks.length;
        const size = (JSON.stringify(this.tasks).length / 1024).toFixed(2);
        document.getElementById('dataSize').textContent = size + ' KB';
        document.getElementById('dataModal').classList.remove('hidden');
    },

    closeDataPanel() {
        document.getElementById('dataModal').classList.add('hidden');
    },

    exportData() {
        const dataStr = JSON.stringify(this.tasks, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tasks-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showStatus('📥 数据导出成功', 'online');
    },

    importData(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const imported = JSON.parse(event.target.result);
                if (Array.isArray(imported)) {
                    this.tasks = imported;
                    this.saveTasks();
                    this.renderCalendar();
                    this.renderTasksList();
                    this.closeDataPanel();
                    this.customDialog.showSuccess('数据导入成功');
                } else {
                    throw new Error('格式错误');
                }
            } catch (err) {
                await this.customDialog.showError('导入失败，文件格式错误，请确保选择正确的JSON文件');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    },

    async clearAllData() {
        const confirmed = await this.customDialog.showConfirm(
            '清除所有数据',
            '⚠️ 警告：此操作将永久删除所有任务数据，且无法恢复！\n\n确定要继续吗？',
            {
                okText: '清除所有数据',
                cancelText: '取消'
            }
        );

        if (confirmed) {
            this.tasks = [];
            this.saveTasks();
            this.renderCalendar();
            this.renderTasksList();
            this.closeDataPanel();
            this.customDialog.showSuccess('所有数据已成功清除', 2000);
            this.showStatus('🗑️ 数据已清除', 'online');
        }
    },

    showStatus(text, type) {
        const indicator = document.getElementById('statusIndicator');
        const dot = document.getElementById('statusDot');
        const statusText = document.getElementById('statusText');

        dot.className = `w-3 h-3 rounded-full ${type === 'online' ? 'bg-success' : 'bg-danger'} animate-pulse`;
        statusText.textContent = text;
        indicator.classList.remove('hidden');

        setTimeout(() => {
            indicator.classList.add('hidden');
        }, 3000);
    },

    installApp() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            this.deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    this.showStatus('✅ 应用安装成功！', 'online');
                }
                this.deferredPrompt = null;
                document.getElementById('installPrompt').classList.add('hidden');
            });
        }
    },

    dismissInstall() {
        document.getElementById('installPrompt').classList.add('hidden');
    }
};

if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register('sw.js', {
                scope: './',
                updateViaCache: 'none'
            });
            console.log('✅ Service Worker注册成功');

            if (registration.waiting) {
                console.log('新版本等待激活');
                App.customDialog.showConfirm('发现新版本，是否立即更新？').then(result => {
                    if (result) {
                        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                        window.location.reload();
                    }
                });
            }

            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                console.log('Service Worker 更新找到');

                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        console.log('新版本已安装，准备激活');
                        App.customDialog.showConfirm('应用有更新可用，是否立即刷新以使用新版本？').then(result => {
                            if (result) {
                                newWorker.postMessage({ type: 'SKIP_WAITING' });
                                window.location.reload();
                            }
                        });
                    }
                });
            });

            navigator.serviceWorker.addEventListener('controllerchange', () => {
                console.log('Service Worker 控制器已变更');
            });
        } catch (err) {
            console.log('❌ Service Worker注册失败', err);
        }
    });
} else {
    console.log('当前浏览器不支持 Service Worker');
}

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    App.deferredPrompt = e;
    document.getElementById('installPrompt').classList.remove('hidden');
});

window.addEventListener('online', () => App.showStatus('🌐 已连接网络', 'online'));
window.addEventListener('offline', () => App.showStatus('📡 离线模式', 'offline'));

window.onclick = (e) => {
    if (e.target.id === 'taskModal' || e.target.id === 'dataModal') {
        e.target.classList.add('hidden');
    }
};

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.getElementById('taskModal').classList.add('hidden');
        document.getElementById('dataModal').classList.add('hidden');
    }
});

App.init();