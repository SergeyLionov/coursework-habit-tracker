const HabitStorage = {
    getHabits() {
        return JSON.parse(localStorage.getItem('habits')) || [];
    },
    saveHabits(habits) {
        localStorage.setItem('habits', JSON.stringify(habits));
    },
    getTheme() {
        return localStorage.getItem('theme') || 'light';
    },
    saveTheme(theme) {
        localStorage.setItem('theme', theme);
    }
};
