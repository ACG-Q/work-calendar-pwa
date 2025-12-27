const Validators = {
    validateTitle(value) {
        if (!value || !value.trim()) {
            return '请输入任务标题';
        }
        if (value.length > Constants.VALIDATION_LIMITS.TITLE_MAX_LENGTH) {
            return `任务标题不能超过${Constants.VALIDATION_LIMITS.TITLE_MAX_LENGTH}个字符`;
        }
        return null;
    },

    validateDate(value) {
        if (!value) {
            return '请选择任务日期';
        }
        return null;
    },

    validateTime(value) {
        if (!value) {
            return '请选择任务时间';
        }
        return null;
    },

    validatePriority(value) {
        const validPriorities = ['high', 'medium', 'low'];
        if (!validPriorities.includes(value)) {
            return '请选择有效的优先级';
        }
        return null;
    },

    validateDescription(value) {
        if (value.length > Constants.VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH) {
            return `任务描述不能超过${Constants.VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH}个字符`;
        }
        return null;
    },

    validateTaskData(data) {
        const errors = {};

        const titleError = this.validateTitle(data.title);
        if (titleError) errors.title = titleError;

        const dateError = this.validateDate(data.date);
        if (dateError) errors.date = dateError;

        const timeError = this.validateTime(data.time);
        if (timeError) errors.time = timeError;

        const priorityError = this.validatePriority(data.priority);
        if (priorityError) errors.priority = priorityError;

        const descriptionError = this.validateDescription(data.description || '');
        if (descriptionError) errors.description = descriptionError;

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    },

    validateDateTime(date, time) {
        if (!date || !time) {
            return null;
        }

        const selectedDateTime = new Date(`${date}T${time}`);
        const now = new Date();
        
        if (selectedDateTime < now) {
            return '您选择的时间已经过去';
        }
        
        return null;
    }
};
