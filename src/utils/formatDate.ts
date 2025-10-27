// utils/formatDate.ts
import moment from 'moment';
export function formatDate(d?: Date) {
  return d ? moment(d).local().format('DD/MM/YYYY') : '';
}
