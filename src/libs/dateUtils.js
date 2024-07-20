import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

export function formatDateForDisplay(date) {
    return dayjs(date).format('DD/MM/YYYY');
}

export function formatDateForStorage(date) {
    return dayjs(date,'DD/MM/YYYY').format('YYYY-MM-DD');
}
export function dateNow(){
    return dayjs().format('YYYY-MM-DD');
}