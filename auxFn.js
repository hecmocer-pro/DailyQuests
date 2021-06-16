const _MS_PER_HOUR = 1000 * 60 * 60;
const _MS_PER_DAY = 1000 * 60 * 60 * 24;
const _MS_PER_WEEK = 1000 * 60 * 60 * 24 * 7;

const now = new Date()
const historyRecord = JSON.parse(localStorage.getItem('DQ_historyRecord')) || [];
console.log(historyRecord)

const dateDiffInHours = (a, b) => {
    // Discard the time and time-zone information.
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate(), a.getHours(), a.getMinutes());
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate(), b.getHours(), b.getMinutes());

    return (utc2 - utc1) / _MS_PER_HOUR;
}

const dateDiffInDays = (a, b) => {
    // Discard the time and time-zone information.
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}

const dateDiffInWeeks = (a, b) => {
    // Discard the time and time-zone information.
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

    return Math.floor((utc2 - utc1) / _MS_PER_WEEK);
}

const setItemInLocalStorage = (id, value) => {
    localStorage.setItem(`DQ_${id}`, value);
    localStorage.setItem(`DQ_${id}-date`, new Date().toString());
}

const setItemInHtml = (id, value) => {
    document.querySelector(`#${id} .insertionPoint`).innerHTML = value
    if (value === 0) {
      document.querySelector(`#${id}`).classList.add('zero-quests')
    } else {
      document.querySelector(`#${id}`).classList.remove('zero-quests')
    }

    if (value === 3) {
      document.querySelector(`#${id}`).classList.add('all-quests')
    } else {
      document.querySelector(`#${id}`).classList.remove('all-quests')
    }
}

const consolidateValue = (id, value) => {
    setItemInLocalStorage(id, value)
    setItemInHtml(id, value)
}

const sumOneToHistoryRecord = (id) => {
    const historyRecord = JSON.parse(localStorage.getItem('DQ_historyRecord')) || [];
    const dateToday = getDateNoTimeFromDate(new Date())
    const foundHistoryRecordIndex = historyRecord.findIndex(a => getDateNoTimeFromDate(a.date) === dateToday)
    if (foundHistoryRecordIndex >= 0) {
        const historyRecordToday = historyRecord[foundHistoryRecordIndex]
        historyRecordToday[id] = (historyRecordToday[id] || 0) + 1
        historyRecord[foundHistoryRecordIndex] = historyRecordToday
    } else {
        const historyRecordToday = {
            date: dateToday,
        }
        historyRecordToday[id] = 1
        historyRecord.push(historyRecordToday)
    }
    localStorage.setItem('DQ_historyRecord', JSON.stringify(historyRecord));
}

const subtractOneToHistoryRecord = (id) => {
    const historyRecord = JSON.parse(localStorage.getItem('DQ_historyRecord')) || [];
    const dateToday = getDateNoTimeFromDate(new Date())
    const foundHistoryRecordIndex = historyRecord.findIndex(a => getDateNoTimeFromDate(a.date) === dateToday)
    if (foundHistoryRecordIndex >= 0) {
        const historyRecordToday = historyRecord[foundHistoryRecordIndex]
        historyRecordToday[id] = (historyRecordToday[id] || 0) - 1
        historyRecord[foundHistoryRecordIndex] = historyRecordToday
    } else {
        const historyRecordToday = {
            date: dateToday,
        }
        historyRecordToday[id] = 0
        historyRecord.push(historyRecordToday)
    }
    localStorage.setItem('DQ_historyRecord', JSON.stringify(historyRecord));
}

const cleanTodaysHistoryRecord = () => {
    const historyRecord = JSON.parse(localStorage.getItem('DQ_historyRecord')) || [];
    const dateToday = getDateNoTimeFromDate(new Date())
    const foundHistoryRecordIndex = historyRecord.findIndex(a => getDateNoTimeFromDate(a.date) === dateToday)
    if (foundHistoryRecordIndex >= 0) {
        historyRecord[foundHistoryRecordIndex] = {
            date: dateToday,
        }
        localStorage.setItem('DQ_historyRecord', JSON.stringify(historyRecord));
    }
}


const join = (t, a, s) => {
    function format(m) {
        let f = new Intl.DateTimeFormat('en', m);
        return f.format(t);
    }
    return a.map(format).join(s);
}

const getDateNoTimeFromDate = (date) => {
    const dateToUse = new Date(date)
    let dateFormat = [{day: 'numeric'}, {month: 'short'}, {year: 'numeric'}];
    let dateFormatted = join(dateToUse, dateFormat, '-');
    return dateFormatted
}

export default {

    getDailyQuest(id) {
        let value = Number(localStorage.getItem(`DQ_${id}`))

        const lastSavedDate = new Date(localStorage.getItem(`DQ_${id}-date`))

        const daysBetween = dateDiffInDays(lastSavedDate, now)
        value += daysBetween
        value = Math.min(value, 3)

        consolidateValue(id, value)
        return value
    },

    getMTGAQuest(id) {
        let value = Number(localStorage.getItem(`DQ_${id}`))

        const resetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), '11', '00')
        const lastSavedDate = new Date(localStorage.getItem(`DQ_${id}-date`))

        const hoursBetweenResetAndLastSavedDate = dateDiffInHours(resetTime, lastSavedDate)
        const hoursBetweenResetAndNow = dateDiffInHours(resetTime, now)
        value += Math.floor(Math.abs(hoursBetweenResetAndLastSavedDate / 24));

        if (-11 < hoursBetweenResetAndLastSavedDate && hoursBetweenResetAndLastSavedDate < 0 && 0 < hoursBetweenResetAndNow) {
          value += 1
        }

        value = Math.min(value, 3)

        consolidateValue(id, value)
        return value
    },

    getWeeklyQuest(id) {
        let value = Number(localStorage.getItem(`DQ_${id}`))

        let lastSavedDate = new Date(localStorage.getItem(`DQ_${id}-date`))
        lastSavedDate.setDate(lastSavedDate.getDate() - 1); // para que las semanas empiecen en lunes y no en domingo

        const weeksBetween = dateDiffInWeeks(lastSavedDate, now)

        if (weeksBetween > 0) {
          value = 3
        }

        consolidateValue(id, value)
        return value
    },

    consolidateValue,
    sumOneToHistoryRecord,
    subtractOneToHistoryRecord,
    cleanTodaysHistoryRecord,

}