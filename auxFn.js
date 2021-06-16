const _MS_PER_HOUR = 1000 * 60 * 60;
const _MS_PER_DAY = 1000 * 60 * 60 * 24;
const _MS_PER_WEEK = 1000 * 60 * 60 * 24 * 7;

const now = new Date()

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
    localStorage.setItem(id, value);
    localStorage.setItem(`${id}-date`, new Date().toString());
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

export default {

    getDailyQuest(id) {
        let value = Number(localStorage.getItem(id))

        const lastSavedDate = new Date(localStorage.getItem(`${id}-date`))

        const daysBetween = dateDiffInDays(lastSavedDate, now)
        value += daysBetween
        value = Math.min(value, 3)

        consolidateValue(id, value)
        return value
    },

    getMTGAQuest(id) {
        let value = Number(localStorage.getItem(id))

        const resetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), '11', '00')
        const lastSavedDate = new Date(localStorage.getItem(`${id}-date`))

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
        let value = Number(localStorage.getItem(id))

        let lastSavedDate = new Date(localStorage.getItem(`${id}-date`))
        lastSavedDate.setDate(lastSavedDate.getDate() - 1); // para que las semanas empiecen en lunes y no en domingo

        const weeksBetween = dateDiffInWeeks(lastSavedDate, now)

        if (weeksBetween > 0) {
          value = 3
        }

        consolidateValue(id, value)
        return value
    },

    consolidateValue

}