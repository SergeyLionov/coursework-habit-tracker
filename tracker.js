const HabitTracker = {
    getPastDates(daysCount) {
        const dates = [];
        for (let i = daysCount - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            dates.push(date.toISOString().split('T')[0]);
        }
        return dates;
    },

    addHabit(name) {
        const habits = HabitStorage.getHabits();
        const newHabit = {
            id: Date.now().toString(),
            name: name.trim(),
            history: [] 
        };
        habits.push(newHabit);
        HabitStorage.saveHabits(habits);
        return habits;
    },

    deleteHabit(id) {
        const habits = HabitStorage.getHabits();
        const filtered = habits.filter(habit => habit.id !== id);
        HabitStorage.saveHabits(filtered);
    },

    editHabit(id, newName) {
        const habits = HabitStorage.getHabits();
        const habit = habits.find(h => h.id === id);
        if (habit) {
            habit.name = newName.trim();
            HabitStorage.saveHabits(habits);
        }
    },

    toggleDate(id, dateStr) {
        const habits = HabitStorage.getHabits();
        const habit = habits.find(h => h.id === id);
        let isAdded = false;
        
        if (habit) {
            if (habit.history.includes(dateStr)) {
                habit.history = habit.history.filter(d => d !== dateStr);
            } else {
                habit.history.push(dateStr);
                isAdded = true;
            }
            HabitStorage.saveHabits(habits);
        }
        return isAdded;
    },

    resetHabitStats(id) {
        const habits = HabitStorage.getHabits();
        const habit = habits.find(h => h.id === id);
        if (habit) {
            habit.history = [];
            HabitStorage.saveHabits(habits);
        }
    },

    calculateCompletionRate(habit, daysCount) {
        const periodDates = this.getPastDates(daysCount);
        const doneInPeriod = habit.history.filter(date => periodDates.includes(date));
        return Math.round((doneInPeriod.length / daysCount) * 100);
    },

    calculateStreak(history) {
        if (history.length === 0) return 0;
        const sortedDates = [...new Set(history)].sort((a, b) => new Date(b) - new Date(a));
        const todayStr = new Date().toISOString().split('T')[0];
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (sortedDates[0] !== todayStr && sortedDates[0] !== yesterdayStr) return 0;

        let streak = 0;
        let checkDate = new Date(sortedDates[0]);

        while (true) {
            const checkStr = checkDate.toISOString().split('T')[0];
            if (history.includes(checkStr)) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }
        return streak;
    },

    getTopHabits() {
        const habits = HabitStorage.getHabits();
        if (habits.length === 0) return [];
        const habitsWithTotal = habits.reduce((acc, habit) => {
            acc.push({ name: habit.name, total: habit.history.length });
            return acc;
        }, []);
        return habitsWithTotal.sort((a, b) => b.total - a.total).slice(0, 3);
    }
};
