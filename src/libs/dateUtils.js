import dayjs from 'dayjs';

export function formatDateForDisplay(date) {
    return dayjs(date).format('DD/MM/YYYY');
}

export function formatDateForStorage(date) {
    return dayjs(date).format('YYYY-MM-DD');
}
export function dateNow(){
    return dayjs().format('YYYY-MM-DD');
}