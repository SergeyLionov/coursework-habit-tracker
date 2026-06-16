document.addEventListener('DOMContentLoaded', () => {

    const habitForm = document.getElementById('habit-form');
    const habitInput = document.getElementById('habit-input');
    const errorMessage = document.getElementById('error-message');
    const habitsList = document.getElementById('habits-list');
    const topHabitsContainer = document.getElementById('top-habits');
    const themeToggleBtn = document.getElementById('theme-toggle');

    const calendarModal = document.getElementById('calendar-modal');
    const modalHabitName = document.getElementById('modal-habit-name');
    const modalMonthTitle = document.getElementById('modal-month-title');
    const monthGrid = document.getElementById('month-grid');
    const closeModalBtn = document.querySelector('.close-modal');

    let currentTheme = HabitStorage.getTheme();
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeButtonText(currentTheme);

    themeToggleBtn.addEventListener('click', () => {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', currentTheme);
        HabitStorage.saveTheme(currentTheme);
        updateThemeButtonText(currentTheme);
    });

    function updateThemeButtonText(theme) {
        themeToggleBtn.textContent = theme === 'light' ? '🌙 Темная тема' : '☀️ Светлая тема';
    }


    function updateUI() {
        renderHabits();
        renderTopStats();
    }

    function renderHabits() {
        const habits = HabitStorage.getHabits();
        const last7Days = HabitTracker.getPastDates(7);

        if (habits.length === 0) {
            habitsList.innerHTML = '<p>У вас пока нет привычек. Добавьте первую выше!</p>';
            return;
        }

        habitsList.innerHTML = habits.map(habit => {
            const weekProgress = HabitTracker.calculateCompletionRate(habit, 7);
            const monthProgress = HabitTracker.calculateCompletionRate(habit, 30);
            const streak = HabitTracker.calculateStreak(habit.history);

            const calendarHTML = last7Days.map(date => {
                const isChecked = habit.history.includes(date) ? 'checked' : '';
                const displayDate = date.split('-')[2]; 
                return `
                    <div class="day-cell">
                        <span>${displayDate}</span>
                        <button class="check-btn ${isChecked}" data-id="${habit.id}" data-date="${date}">
                            ✓
                        </button>
                    </div>
                `;
            }).join('');

            return `
                <div class="habit-row">
                    <div class="habit-header">
                        <h3>${habit.name}</h3>
                        <div class="habit-controls">
                            <button class="btn-primary open-calendar-btn" data-id="${habit.id}">🗓️ Месяц</button>
                            <button class="btn-primary edit-btn" data-id="${habit.id}">✏️</button>
                            <button class="btn-danger reset-btn" data-id="${habit.id}">🔄 Сброс</button>
                            <button class="btn-danger delete-btn" data-id="${habit.id}">❌</button>
                        </div>
                    </div>
                    
                    <div class="calendar-grid">
                        ${calendarHTML}
                    </div>

                    <div class="stats-box">
                        <span>🔥 Серия: <strong>${streak} дн.</strong></span>
                        <span>📊 Неделя: <strong>${weekProgress}%</strong></span>
                        <span>📅 Месяц: <strong>${monthProgress}%</strong></span>
                    </div>
                </div>
            `;
        }).join('');
    }

    function renderTopStats() {
        const top = HabitTracker.getTopHabits();
        if (top.length === 0) {
            topHabitsContainer.innerHTML = 'Нет данных для статистики.';
            return;
        }
        topHabitsContainer.innerHTML = `<ol>` + top.map(h => 
            `<li><strong>${h.name}</strong> — выполнена раз: ${h.total}</li>`
        ).join('') + `</ol>`;
    }


    function openMonthlyCalendar(habitId) {
        const habits = HabitStorage.getHabits();
        const habit = habits.find(h => h.id === habitId);
        if (!habit) return;

        modalHabitName.textContent = habit.name;

        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();

        const monthNames = [
            "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
            "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
        ];
        modalMonthTitle.textContent = `${monthNames[month]} ${year}`;

        const firstDayIndex = new Date(year, month, 1).getDay();

        const shift = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
        const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

        let gridHTML = '';

        for (let i = 0; i < shift; i++) {
            gridHTML += `<div class="month-day empty"></div>`;
        }

        for (let day = 1; day <= totalDaysInMonth; day++) {

            const dayStr = String(day).padStart(2, '0');
            const monthStr = String(month + 1).padStart(2, '0');
            const fullDateStr = `${year}-${monthStr}-${dayStr}`;

            const isCompleted = habit.history.includes(fullDateStr) ? 'completed' : '';
            gridHTML += `<div class="month-day ${isCompleted}">${day}</div>`;
        }

        monthGrid.innerHTML = gridHTML;
        calendarModal.style.display = 'flex';
    }

    closeModalBtn.addEventListener('click', () => calendarModal.style.display = 'none');
    window.addEventListener('click', (e) => { if (e.target === calendarModal) calendarModal.style.display = 'none'; });


    habitForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const value = habitInput.value.trim();
        if (!value) {
            errorMessage.textContent = 'Название привычки не может быть пустым!';
            return;
        }
        errorMessage.textContent = '';
        HabitTracker.addHabit(value);
        habitInput.value = '';
        updateUI();
    });

    habitsList.addEventListener('click', (e) => {

        if (e.target.classList.contains('check-btn')) {
            const id = e.target.dataset.id;
            const date = e.target.dataset.date;
            
            const isAdded = HabitTracker.toggleDate(id, date);
            
            if (isAdded) {
                e.target.classList.add('checked-anim');

                setTimeout(() => updateUI(), 350);
            } else {
                updateUI();
            }
        }

        if (e.target.classList.contains('open-calendar-btn')) {
            const id = e.target.dataset.id;
            openMonthlyCalendar(id);
        }

        if (e.target.classList.contains('delete-btn')) {
            const id = e.target.dataset.id;
            if (confirm('Вы уверены, что хотите удалить эту привычку?')) {
                HabitTracker.deleteHabit(id);
                updateUI();
            }
        }

        if (e.target.classList.contains('edit-btn')) {
            const id = e.target.dataset.id;
            const currentName = e.target.closest('.habit-row').querySelector('h3').textContent;
            const newName = prompt('Измените название привычки:', currentName);
            if (newName && newName.trim() !== '') {
                HabitTracker.editHabit(id, newName);
                updateUI();
            }
        }

        if (e.target.classList.contains('reset-btn')) {
            const id = e.target.dataset.id;
            if (confirm('Сбросить всю историю выполнения для этой привычки?')) {
                HabitTracker.resetHabitStats(id);
                updateUI();
            }
        }
    });

    updateUI();
});

